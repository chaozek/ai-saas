"use client"

import { useTRPC } from "@/trcp/client";
import { useSuspenseQuery } from "@tanstack/react-query";


export default function Client() {
     const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.projects.getmany.queryOptions())
    return <div>Client {JSON.stringify(data, null, 2)}</div>
}