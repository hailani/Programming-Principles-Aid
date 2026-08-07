//Splash page will remove in the future, just here for testing puproses

import { Inter } from "@next/font/google";
import styles from "./page.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${styles.splashPage} ${inter.className}`}>
      <div className={styles.splashContent}>
        <div className={styles.splashIcon}> &lt;/&gt; </div>

        <h1 className={styles.splashTitle}>
          Programming Principles <br /> Aid
        </h1>

        <p className={styles.splashSubtitle}>
          "Think Logically, Code Confidently"
        </p>

        <a href="/login" className={styles.splashLink}>
          NEXT
        </a>
      </div>
    </main>
  );
}
