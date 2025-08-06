import { PrismaClient } from '../src/generated/prisma';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CzechFoodRow {
  OrigFdCd: string;
  OrigFdNm: string;
  EngFdNam: string;
  SciNam: string;
  EDIBLE: string;
  NCF: string;
  FACF: string;
  'ENERC [kJ]': string;
  'ENERC [kcal]': string;
  'FAT [g]': string;
  'FASAT [g]': string;
  'FAMS [g]': string;
  'FAPU [g]': string;
  'FATRN [g]': string;
  'CHOT [g]': string;
  'CHO [g]': string;
  'SUGAR [g]': string;
  'FIBT [g]': string;
  'PROT [g]': string;
  'ASH [g]': string;
  'NA [mg]': string;
  'NACL [g]': string;
  'WATER [g]': string;
}

async function importCzechFoods() {
  try {
    console.log('🚀 Začínám import české databáze potravin...');

    const csvPath = path.join(process.cwd(), 'NutriDatabaze-v9.24-data-export (2).csv');
    const csvBuffer = fs.readFileSync(csvPath);

    // Zkusit různé kódování pro Windows-1250
    let csvContent: string;
    try {
      // Zkusit různé kódování
      const iconv = require('iconv-lite');

      // Zkusit cp1250 (Windows-1250)
      csvContent = iconv.decode(csvBuffer, 'cp1250');

      // Ověřit, jestli se diakritika správně dekódovala
      if (csvContent.includes('Brambork')) {
        console.log('cp1250 failed, trying iso-8859-2...');
        csvContent = iconv.decode(csvBuffer, 'iso-8859-2');
      }

      if (csvContent.includes('Brambork')) {
        console.log('iso-8859-2 failed, trying windows-1250...');
        csvContent = iconv.decode(csvBuffer, 'windows-1250');
      }

    } catch (error) {
      console.log('iconv-lite not available, trying latin1...');
      csvContent = csvBuffer.toString('latin1');
    }

    // Parse CSV
    const records = await new Promise<CzechFoodRow[]>((resolve, reject) => {
      parse(csvContent, {
        columns: true,
        delimiter: ';',
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records as CzechFoodRow[]);
      });
    });

    console.log(`📊 Načteno ${records.length} potravin z CSV`);

    // Vymazat existující data
    console.log('🗑️ Mažu existující data...');
    await prisma.czechFood.deleteMany();

    // Importovat nová data
    console.log('📥 Importuji data do databáze...');
    let imported = 0;
    let errors = 0;

    for (const record of records) {
      try {
        // Přeskočit řádky s chybějícími daty
        if (!record.OrigFdCd || !record.OrigFdNm || !record['ENERC [kcal]']) {
          continue;
        }

        await prisma.czechFood.create({
          data: {
            code: record.OrigFdCd,
            name: record.OrigFdNm,
            englishName: record.EngFdNam || null,
            scientificName: record.SciNam || null,
            calories: parseFloat(record['ENERC [kcal]']) || 0,
            protein: parseFloat(record['PROT [g]']) || 0,
            carbs: parseFloat(record['CHOT [g]']) || 0,
            fat: parseFloat(record['FAT [g]']) || 0,
            fiber: record['FIBT [g]'] ? parseFloat(record['FIBT [g]']) : null,
            sugar: record['SUGAR [g]'] ? parseFloat(record['SUGAR [g]']) : null,
            water: record['WATER [g]'] ? parseFloat(record['WATER [g]']) : null,
            sodium: record['NA [mg]'] ? parseFloat(record['NA [mg]']) : null,
            edible: record.EDIBLE ? parseFloat(record.EDIBLE) : null,
          }
        });

        imported++;

        if (imported % 100 === 0) {
          console.log(`✅ Importováno ${imported} potravin...`);
        }

      } catch (error) {
        console.error(`❌ Chyba při importu: ${record.OrigFdNm}`, error);
        errors++;
      }
    }

    console.log(`🎉 Import dokončen!`);
    console.log(`✅ Úspěšně importováno: ${imported} potravin`);
    console.log(`❌ Chyb: ${errors}`);

    // Ověření
    const count = await prisma.czechFood.count();
    console.log(`📊 Celkem v databázi: ${count} potravin`);

  } catch (error) {
    console.error('❌ Chyba při importu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spustit import
importCzechFoods();