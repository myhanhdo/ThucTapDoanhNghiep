import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';

// material
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';
// redux
import { useDispatch } from '../../../redux/store';
import { getProducts } from '../../../redux/slices/product';
// utils
import { fNumber } from '../../../utils/formatNumber';
//
import { BaseOptionChart } from '../../charts';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 392;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible'
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`
  }
}));

// ----------------------------------------------------------------------

// const CHART_DATA = [12244, 53345, 44313, 78343];
// const CHART_DATA = [0, 0, 0, 0, 0];

export default function AppCurrentDownload() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [CHART_DATA, setChartData] = useState([0, 0, 0, 0, 0]);

  function excuteAfterDispatchSuccess(globalStateNewest) {
    let chartData;
    chartData = [];
    chartData = [0, 0, 0, 0, 0];

    globalStateNewest.product.products.map((value) => {
      if (value.rate >= 1 && value.rate <= 5) {
        chartData[value.rate - 1] += 1;
      }
      return null;
    });
    setChartData(chartData);
  }

  useEffect(() => {
    dispatch(getProducts(excuteAfterDispatchSuccess));
  }, [dispatch]);

  const chartOptions = merge(BaseOptionChart(), {
    colors: [
      theme.palette.primary.lighter,
      theme.palette.primary.light,
      theme.palette.primary.main,
      theme.palette.primary.dark
    ],
    labels: ['1 star', '2 star', '3 star', '4 star', '5 star'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: 'center' },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: (seriesName) => `${seriesName}`
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '90%',
          labels: {
            value: {
              formatter: (val) => fNumber(val)
            },
            total: {
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              }
            }
          }
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader title="Current Review" />
      <ChartWrapperStyle dir="ltr">
        <ReactApexChart type="donut" series={CHART_DATA} options={chartOptions} height={280} />
      </ChartWrapperStyle>
    </Card>
  );
}
