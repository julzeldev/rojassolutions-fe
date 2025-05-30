import {
  Box,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useCallback } from 'react';
import data from '../../../gh_agent/sucursalList.model.json';
import type { Subsidiary } from '../../types/subsidiary';
import SubsidiaryTable from './SubsidiaryDesktop';
import SubsidiaryCardList from './SubsidiaryMobile';

const SubsidiaryTableResponsive: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const subsidiaries: Subsidiary[] = data as unknown as Subsidiary[];

  const openInGoogleMaps = useCallback((address: string, plusCode?: string, mapsUrl?: string) => () => {
    let url = '';
    if (mapsUrl) {
      url = mapsUrl;
    } else if (plusCode) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    window.open(url, '_blank');
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Sucursales
      </Typography>
      {isMobile ? (
        <SubsidiaryCardList subsidiaries={subsidiaries} openInGoogleMaps={openInGoogleMaps} />
      ) : (
        <SubsidiaryTable subsidiaries={subsidiaries} openInGoogleMaps={openInGoogleMaps} />
      )}
    </Box>
  );
};

export default SubsidiaryTableResponsive;
