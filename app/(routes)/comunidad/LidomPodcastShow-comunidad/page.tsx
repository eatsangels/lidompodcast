import React from 'react'
import { Users, HeartHandshake, GraduationCap, Gift, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

function LidomPodcastShowEnTuComunidad() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative bg-blue-900 py-24">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/Fondo.jpg')] bg-cover bg-center opacity-10" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            LidomPodcastShow en tu Comunidad
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
                            Descubre cómo el equipo de los Lidom Podcast Show impacta tu comunidad con acciones sociales y deportivas
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-6">
                        <HeartHandshake className="h-12 w-12 text-blue-900" />
                        <h3 className="mt-4 text-xl font-semibold">Programas Sociales</h3>
                        <p className="mt-2 text-gray-600">Iniciativas para el bienestar de comunidades vulnerables.</p>
                        <Button className="bg-blue-500 text-white mt-4">Ver más</Button>
                    </Card>
                    <Card className="p-6">
                        <GraduationCap className="h-12 w-12 text-blue-900" />
                        <h3 className="mt-4 text-xl font-semibold">Educación y Deporte</h3>
                        <p className="mt-2 text-gray-600">Apoyamos la educación a través del deporte y la disciplina.</p>
                        <Button className="bg-blue-500 text-white mt-4">Ver más</Button>
                    </Card>
                    <Card className="p-6">
                        <Gift className="h-12 w-12 text-blue-900" />
                        <h3 className="mt-4 text-xl font-semibold">Donaciones Solidarias</h3>
                        <p className="mt-2 text-gray-600">Entrega de materiales deportivos y ayudas comunitarias.</p>
                        <Button className="bg-blue-500 text-white mt-4">Ver más</Button>
                    </Card>
                    <Card className="p-6">
                        <Mic className="h-12 w-12 text-blue-900" />
                        <h3 className="mt-4 text-xl font-semibold">Charlas y Motivación</h3>
                        <p className="mt-2 text-gray-600">Historias inspiradoras de jugadores y expertos.</p>
                        <Button className="bg-blue-500 text-white mt-4">Ver más</Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default LidomPodcastShowEnTuComunidad
