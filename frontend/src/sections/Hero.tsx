import { motion } from 'framer-motion'

function Hero() {
  return (
    <section id="hero" className="flex min-h-screen items-center justify-center px-6 pt-24">
      <motion.div
        className="glass-panel max-w-2xl px-10 py-12 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">Carlos Diaz</h1>
        <p className="mt-4 text-lg text-neutral-300">
          Desarrollador de software construyendo productos reales.
        </p>
        <a
          href="#proyectos"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform hover:scale-105"
        >
          Ver proyectos
        </a>
      </motion.div>
    </section>
  )
}

export default Hero
