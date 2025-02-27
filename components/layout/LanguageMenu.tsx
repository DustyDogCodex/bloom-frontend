import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import * as React from 'react';
import { RootState } from '../../app/store';
import { generateLanguageMenuEvent, HEADER_LANGUAGE_MENU_CLICKED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import Link from '../common/Link';

const menuItemStyle = {
  ':hover': { backgroundColor: 'transparent' },
  '& .MuiTouchRipple-root span': {
    backgroundColor: 'transparent',
  },
} as const;

const buttonStyle = {
  height: 40,
  minWidth: { xs: 40, md: 64 },
  paddingX: 1,
  gap: 0.75,
  fontWeight: 400,

  ':hover': { backgroundColor: 'background.default' },

  '& .MuiTouchRipple-root span': {
    backgroundColor: 'primary.main',
    opacity: 0.2,
  },
  '& .MuiButton-startIcon': { display: { xs: 'none', md: 'inline-flex' }, mx: 0 },
} as const;

export default function LanguageMenu() {
  const router = useRouter();
  const locale = router.locale;
  const locales = router.locales;
  const t = useTranslations('Navigation');
  const { user, partnerAccesses, partnerAdmin } = useTypedSelector((state: RootState) => state);
  const eventUserData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logEvent(HEADER_LANGUAGE_MENU_CLICKED, eventUserData);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        qa-id="language-menu-button"
        aria-controls="language-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('languageMenu')}
        color="inherit"
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        size="medium"
        sx={buttonStyle}
      >
        {locale?.toUpperCase()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        MenuListProps={{
          id: 'language-menu',
        }}
      >
        {locales
          ?.filter((language) => language !== locale)
          .map((language) => {
            const languageUppercase = language.toUpperCase();
            return (
              <MenuItem key={language} sx={menuItemStyle}>
                <Button
                  component={Link}
                  href={router.asPath}
                  locale={language}
                  onClick={() => {
                    logEvent(generateLanguageMenuEvent(language), eventUserData);
                  }}
                >
                  {languageUppercase}
                </Button>
              </MenuItem>
            );
          })}
      </Menu>
    </Box>
  );
}
