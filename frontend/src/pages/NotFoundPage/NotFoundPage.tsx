import { useRouter } from "@/shared/router";
import styles from "./NotFoundPage.module.scss";

interface NotFoundPageProps {
  homePath?: string;
}

export function NotFoundPage({ homePath = "/" }: NotFoundPageProps) {
  const { navigate } = useRouter();

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.description}>
          К сожалению, запрашиваемая страница не существует.
        </p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate(homePath);
          }}
          className={styles.link}
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
