interface HeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function Hero({ title, subtitle, description }: HeroProps) {
  return (
    <>
      <h1 className="mb-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.2] font-extrabold tracking-[-0.02em] [text-wrap:balance] text-slate-50 md:mb-6">
        {title}
        <br />
        <span className="bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          {subtitle}
        </span>
      </h1>

      <p className="mb-8 text-base leading-[1.7] text-slate-400 md:mb-12 md:text-xl">
        {description}
      </p>
    </>
  );
}
