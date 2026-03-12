import styles from './Hero.module.scss';

interface HeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function Hero({ title, subtitle, description }: HeroProps) {
  return (
    <>
      <h1 className={styles.title}>
        {title}
        <br />
        <span className={styles.gradient}>{subtitle}</span>
      </h1>

      <p className={styles.description}>{description}</p>
    </>
  );
}
