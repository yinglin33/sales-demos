'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
    const [submitted, setSubmitted] = useState(false)
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        origin: '',
        destination: ''
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }
    return (
        <div className="min-h-[70vh] px-4 py-16 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">Trusted Home Services</h1>
            <p className="text-slate-600 mb-8">Cleaning, moving, handyman, and more — reliable pros for every job.</p>
            <div className="flex items-center justify-center gap-3 mb-12">
                <Link href="/configure" className="px-6 py-3 rounded-md bg-sky-600 text-white hover:bg-sky-700">Schedule</Link>
                <Link href="#services" className="px-6 py-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">See Services</Link>
            </div>

            <section id="services" className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mt-6">
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <h3 className="font-semibold mb-1">Cleaning</h3>
                    <p className="text-sm text-slate-600">Deep cleans, recurring, move-in/out.</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <h3 className="font-semibold mb-1">Moving</h3>
                    <p className="text-sm text-slate-600">Local moves, packing, furniture.</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <h3 className="font-semibold mb-1">Handyman</h3>
                    <p className="text-sm text-slate-600">Repairs, mounting, small projects.</p>
                </div>
            </section>

            <div className="mt-12">
                <Link href="/configure" className="px-6 py-3 rounded-md bg-sky-600 text-white hover:bg-sky-700">Schedule</Link>
            </div>

            <section className="mt-16 text-left">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Get a Quote</h2>
                {!submitted ? (
                    <form onSubmit={submit} className="bg-white rounded-lg border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="First Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Last Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="(555) 123-4567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="you@email.com" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Address</label>
                            <input value={form.origin} onChange={(e)=>setForm({...form, origin: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Start address" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Final Address</label>
                            <input value={form.destination} onChange={(e)=>setForm({...form, destination: e.target.value})} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="End address" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" className="px-6 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700">Submit</button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Thanks for your interest!</h3>
                        <p className="text-slate-600">We received your info and will reach out shortly.</p>
                    </div>
                )}
            </section>
        </div>
    )
}
