import { useTranslation } from 'react-i18next';
import { Button } from '../../shared';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'vi' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('p2p_app_lang', newLang);
    };

    return (
        <Button variant="outline" size="sm" onClick={toggleLanguage} className="w-full justify-start text-xs h-8">
            Lang: {i18n.language === 'en' ? 'EN' : 'VI'}
        </Button>
    );
}
