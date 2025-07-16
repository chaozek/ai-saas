"use client"

import { Button } from "@/components/ui/button"
import { PricingTable, useClerk } from "@clerk/nextjs"
import Image from "next/image"
import React from "react"

export default function PricingPage() {
     const clerk = useClerk()

     return <div className="flex flex-col max-w-3xl mx-auto w-full py-12 px-4">
          <section className="flex flex-col items-center justify-center gap-4">
               <div>
                    <Image src="/logo.svg" alt="logo" width={100} height={100} />
               </div>
               <h1 className="text-2xl font-bold">Pricing</h1>
               <p className="text-sm text-muted-foreground">
                    No credit card required. Cancel anytime.
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
