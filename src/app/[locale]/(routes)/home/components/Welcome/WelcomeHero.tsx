import styles from './Welcome.module.scss';

interface WelcomeHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function WelcomeHero({ title, subtitle, description }: WelcomeHeroProps) {
  return (
    <>
      <h1 className={styles.title}>
        {title}
        <br />
        <span className={styles.titleGradient}>{subtitle}</span>
      </h1>

      <p className={styles.description}>{description}</p>
    </>
  );
}
