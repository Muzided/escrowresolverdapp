"use client"
import { Suspense } from 'react'
import Main from "./Main"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
     <Main/>
    </Suspense>
  );
}

