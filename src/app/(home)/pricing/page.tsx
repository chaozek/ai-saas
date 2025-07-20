"use client"

import { Button } from "@/components/ui/button"
import { PricingTable, useClerk } from "@clerk/nextjs"
import { Logo } from "@/components/ui/logo"
import React from "react"

export default function PricingPage() {
     const clerk = useClerk()

     return <div className="flex flex-col max-w-3xl mx-auto w-full py-12 px-4">
          <section className="flex flex-col items-center justify-center gap-4">
               <div>
                    <Logo alt="logo" width={100} height={100} />
               </div>
               <h1 className="text-2xl font-bold">Ceník</h1>
               <p className="text-sm text-muted-foreground">
                    Kreditní karta není vyžadována. Zrušte kdykoliv.
               </p>
          <PricingTable
          appearance={{
               elements: {
                    logo: {
                         width: 100,
                         height: 100,
                    },
                    pricingTableCard: "border! shadow-none! rounded-lg!"
               }
          }}
          />
          </section>
     </div>
}
