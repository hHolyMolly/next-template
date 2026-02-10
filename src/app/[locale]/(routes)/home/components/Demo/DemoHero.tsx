import styles from './Demo.module.scss';

interface DemoHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function DemoHero({ title, subtitle, description }: DemoHeroProps) {
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
