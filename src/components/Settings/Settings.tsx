import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import styles from "./Settings.module.css";

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className={styles.settingsContainer}>
      <h2>{t("settings.title")}</h2>

      {/* Theme Settings */}
      <div className={styles.settingsSection}>
        <h3>{t("settings.theme")}</h3>
        <div className={styles.settingsOption}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span>
            {theme === "dark" ? t("settings.dark") : t("settings.light")}
          </span>
        </div>
      </div>

      {/* Language Settings */}
      <div className={styles.settingsSection}>
        <h3>{t("settings.language")}</h3>
        <div className={styles.languageOptions}>
          <button
            className={`${styles.languageBtn} ${
              language === "vi" ? styles.active : ""
            }`}
            onClick={() => changeLanguage("vi")}
          >
            {t("settings.vietnamese")}
          </button>
          <button
            className={`${styles.languageBtn} ${
              language === "en" ? styles.active : ""
            }`}
            onClick={() => changeLanguage("en")}
          >
            {t("settings.english")}
          </button>
        </div>
      </div>

      {/* Additional Settings */}
      <div className={styles.settingsSection}>
        <h3>{t("settings.preferences")}</h3>
        <div className={styles.settingsOption}>
          <span>{t("settings.notifications")}</span>
          <label className={styles.toggleSwitch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
