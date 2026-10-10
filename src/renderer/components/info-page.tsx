import styles from "./info-page.module.scss";

export interface InfoPageProps {
  message?: string;
}

export function InfoPage({ message }: InfoPageProps) {
  return (
    <div className={styles.infoPage}>
      <p className={styles.infoMessage}>{message}</p>
    </div>
  );
}
