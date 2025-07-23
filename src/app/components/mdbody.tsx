import styles from "./mdstyle.module.css";

export default function MDBody({ children }: { children: React.ReactNode }) {
  console.log(styles);
  return <div className={`${styles.markdown} ${styles.hljs}`}>{children}</div>;
}
