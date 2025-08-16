import styles from "./info-page.module.scss";
import stylesInline from "./info-page.module.scss?inline";

export interface InfoPageProps {
  message?: string;
}

export function InfoPage({ message }: InfoPageProps) {
  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.infoPage}>
        <p className={styles.infoMessage}>{message}</p>
      </div>
    </>
  );
}
