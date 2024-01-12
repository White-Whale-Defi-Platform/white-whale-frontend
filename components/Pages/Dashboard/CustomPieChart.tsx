import React, { PureComponent } from 'react'

import { DashboardData } from 'components/Pages/Dashboard/Dashboard'
import { ChainStat } from 'components/Pages/Dashboard/DashboardPieChart'
import { formatPrice } from 'libs/num'
import { Pie, PieChart, Sector } from 'recharts'

const aprTextComponent = (
  ex: number, cos: number, ey: string | number, textAnchor: string, value: number,
) => <text x={(ex + ((cos >= 0 ? 1 : -1) * 12))} y={ey} textAnchor={textAnchor} fontWeight={'bold'} fill="white">{`${value.toFixed(2)}%`}</text>
const regularTextComponent = (
  ex: number, cos: number, ey: string | number, textAnchor: string, value: any,
) => <text x={(ex + ((cos >= 0 ? 1 : -1) * 12))} y={ey} textAnchor={textAnchor} fontWeight={'bold'} fill="white">{`$${formatPrice(value)}`}</text>

interface PieChartProps {
  data: DashboardData[]
  chainStat: ChainStat
}

export default class CustomPieChart extends PureComponent<PieChartProps> {
  state = {
    activeIndex: 0,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    }
    this.onPieEnter = this.onPieEnter.bind(this);
  }

  onPieEnter(_, index) {
    this.setState({
      activeIndex: index,
    });
  }

  renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = (cx + ((outerRadius + 10) * cos))
    const sy = (cy + ((outerRadius + 10) * sin));
    const mx = (cx + ((outerRadius + 30) * cos))
    const my = (cy + ((outerRadius + 30) * sin))
    const ex = (mx + ((cos >= 0 ? 1 : -1) * 22))
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const { chainStat } = this.props
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={'white'} fontWeight={'bold'}>
          {payload.name === 'Terra2' ? 'Terra' : payload.name === 'Terra' ? 'Terra-Classic' : payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={payload.color}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={payload.color}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        {chainStat === ChainStat.apr ? aprTextComponent(
          ex, cos, ey, textAnchor, value,
        ) : regularTextComponent(
          ex, cos, ey, textAnchor, value,
        )}
        <text x={(ex + ((cos >= 0 ? 1 : -1) * 12))} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  }

  render() {
    const { activeIndex } = this.state
    const { data } = this.props
    return (
      <PieChart width={550} height={355}>
        <Pie
          activeIndex={activeIndex}
          activeShape={this.renderActiveShape}
          data={data}
          cx="55%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          dataKey="value"
          onMouseEnter={this.onPieEnter}
        />
      </PieChart>
    )
  }
}
