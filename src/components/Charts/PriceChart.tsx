import { AxisBottom, TickFormatter } from '@visx/axis'
import { localPoint } from '@visx/event'
import { EventType } from '@visx/event/lib/types'
import { GlyphCircle } from '@visx/glyph'
import { Group } from '@visx/group'
import { Line, LinePath } from '@visx/shape'
import { bisect, curveBasis, NumberValue, scaleLinear } from 'd3'
import { radius } from 'd3-curve-circlecorners'
import { useActiveLocale } from 'hooks/useActiveLocale'
import useTheme from 'hooks/useTheme'
import { TimePeriod } from 'hooks/useTopTokens'
import { useCallback, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'
import {
  dayHourFormatter,
  hourFormatter,
  monthDayFormatter,
  monthFormatter,
  monthYearDayFormatter,
  monthYearFormatter,
  weekFormatter,
} from 'utils/formatChartTimes'

import data from './data.json'

const TIME_DISPLAYS: Record<string, TimePeriod> = {
  '1H': TimePeriod.hour,
  '1D': TimePeriod.day,
  '1W': TimePeriod.week,
  '1M': TimePeriod.month,
  '1Y': TimePeriod.year,
  ALL: TimePeriod.all,
}

type PricePoint = { value: number; timestamp: number }

function getPriceBounds(pricePoints: PricePoint[]): [number, number] {
  const prices = pricePoints.map((x) => x.value)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return [min, max]
}

const StyledUpArrow = styled(ArrowUpRight)`
  color: ${({ theme }) => theme.accentSuccess};
`
const StyledDownArrow = styled(ArrowDownRight)`
  color: ${({ theme }) => theme.accentFailure};
`

function getDelta(start: number, current: number) {
  const delta = (current / start - 1) * 100
  const isPositive = Math.sign(delta) > 0

  const formattedDelta = delta.toFixed(2) + '%'
  if (isPositive) {
    return ['+' + formattedDelta, <StyledUpArrow size={16} key="arrow-up" />]
  } else if (delta === 0) {
    return [formattedDelta, null]
  }
  return [formattedDelta, <StyledDownArrow size={16} key="arrow-down" />]
}

export const ChartWrapper = styled.div`
  position: relative;
  overflow: visible;
`

export const ChartHeader = styled.div`
  position: absolute;
`

export const TokenPrice = styled.span`
  font-size: 36px;
  line-height: 44px;
`
export const DeltaContainer = styled.div`
  height: 16px;
  display: flex;
  align-items: center;
`
const ArrowCell = styled.div`
  padding-left: 2px;
  display: flex;
`
export const TimeOptionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  gap: 4px;
`
const TimeButton = styled.button<{ active: boolean }>`
  background-color: ${({ theme, active }) => (active ? theme.accentActive : 'transparent')};
  font-size: 14px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};
`

function getTicks(startTimestamp: number, endTimestamp: number, numTicks = 5) {
  const ticks = []
  for (let i = 1; i < numTicks + 1; i++) {
    ticks.push(endTimestamp - ((endTimestamp - startTimestamp) / (numTicks + 1)) * i)
  }
  return ticks
}

const getTickFormat = (
  startTimestamp: number,
  endTimestamp: number,
  activeTimePeriod: TimePeriod,
  locale: string
): [TickFormatter<NumberValue>, (v: number) => string, number[]] => {
  switch (activeTimePeriod) {
    case TimePeriod.hour:
      return [hourFormatter(locale), dayHourFormatter(locale), getTicks(startTimestamp, endTimestamp)]
    case TimePeriod.day:
      return [hourFormatter(locale), dayHourFormatter(locale), getTicks(startTimestamp, endTimestamp)]
    case TimePeriod.week:
      return [weekFormatter(locale), dayHourFormatter(locale), getTicks(startTimestamp, endTimestamp, 6)]
    case TimePeriod.month:
      return [monthDayFormatter(locale), dayHourFormatter(locale), getTicks(startTimestamp, endTimestamp)]
    case TimePeriod.year:
      return [monthFormatter(locale), monthYearDayFormatter(locale), getTicks(startTimestamp, endTimestamp)]
    case TimePeriod.all:
      return [monthYearFormatter(locale), monthYearDayFormatter(locale), getTicks(startTimestamp, endTimestamp)]
  }
}

interface PriceChartProps {
  width: number
  height: number
}

export function PriceChart({ width, height }: PriceChartProps) {
  const [activeTimePeriod, setTimePeriod] = useState(TimePeriod.hour)
  const locale = useActiveLocale()
  const theme = useTheme()

  /* TODO: Implement API calls & cache to use here */
  const pricePoints = data[activeTimePeriod]
  const startingPrice = pricePoints[0]
  const endingPrice = pricePoints[pricePoints.length - 1]
  const initialState = { pricePoint: endingPrice, xCoordinate: null }
  const [selected, setSelected] = useState<{ pricePoint: PricePoint; xCoordinate: number | null }>(initialState)

  const margin = { top: 86, bottom: 32, crosshair: 72 }
  const timeOptionsHeight = 44
  const crosshairDateOverhang = 80
  const graphWidth = width + crosshairDateOverhang
  const graphHeight = height - timeOptionsHeight
  const graphInnerHeight = graphHeight - margin.top - margin.bottom

  // Defining scales
  // x scale
  const timeScale = scaleLinear().domain([startingPrice.timestamp, endingPrice.timestamp]).range([0, width])
  // y scale
  const rdScale = scaleLinear().domain(getPriceBounds(pricePoints)).range([graphInnerHeight, 0])

  const handleHover = useCallback(
    (event: Element | EventType) => {
      const { x } = localPoint(event) || { x: 0 }
      const x0 = timeScale.invert(x) // get timestamp from the scale
      const index = bisect(
        pricePoints.map((x) => x.timestamp),
        x0,
        1
      )

      const d0 = pricePoints[index - 1]
      const d1 = pricePoints[index]
      let pricePoint = d0

      const hasPreviousData = d1 && d1.timestamp
      if (hasPreviousData) {
        pricePoint = x0.valueOf() - d0.timestamp.valueOf() > d1.timestamp.valueOf() - x0.valueOf() ? d1 : d0
      }

      setSelected({ pricePoint, xCoordinate: timeScale(pricePoint.timestamp) })
    },
    [timeScale, pricePoints]
  )

  const [tickFormatter, crosshairDateFormatter, ticks] = getTickFormat(
    startingPrice.timestamp,
    endingPrice.timestamp,
    activeTimePeriod,
    locale
  )
  const [delta, arrow] = getDelta(startingPrice.value, selected.pricePoint.value)
  const crosshairAtEdge = Boolean(selected.xCoordinate && selected.xCoordinate > width * 0.97)

  return (
    <ChartWrapper>
      <ChartHeader>
        <TokenPrice>${selected.pricePoint.value.toFixed(2)}</TokenPrice>
        <DeltaContainer>
          {delta}
          <ArrowCell>{arrow}</ArrowCell>
        </DeltaContainer>
      </ChartHeader>
      <svg width={graphWidth} height={graphHeight}>
        <AxisBottom
          scale={timeScale}
          stroke={theme.backgroundOutline}
          tickFormat={tickFormatter}
          tickStroke={theme.backgroundOutline}
          tickLength={4}
          tickTransform={'translate(0 -5)'}
          tickValues={ticks}
          top={graphHeight - 1}
          tickLabelProps={() => ({
            fill: theme.textSecondary,
            fontSize: 12,
            textAnchor: 'middle',
            transform: 'translate(0 -24)',
          })}
        />
        {selected.xCoordinate !== null && (
          <g>
            <text
              x={selected.xCoordinate + (crosshairAtEdge ? -4 : 4)}
              y={margin.crosshair + 10}
              textAnchor={crosshairAtEdge ? 'end' : 'start'}
              fontSize={12}
              fill={theme.textSecondary}
            >
              {crosshairDateFormatter(selected.pricePoint.timestamp)}
            </text>
            <Line
              from={{ x: selected.xCoordinate, y: margin.crosshair }}
              to={{ x: selected.xCoordinate, y: graphHeight }}
              stroke={theme.backgroundOutline}
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="4,4"
            />
          </g>
        )}
        <Group top={margin.top}>
          <LinePath
            /* ALL chart renders poorly using circle corners; use d3 curve for ALL instead */
            curve={activeTimePeriod === TimePeriod.all ? curveBasis : radius(0.25)}
            stroke={theme.accentActive}
            strokeWidth={2}
            data={pricePoints}
            x={(d: PricePoint) => timeScale(d.timestamp) ?? 0}
            y={(d: PricePoint) => rdScale(d.value) ?? 0}
          />
          {selected.xCoordinate !== null && (
            <g>
              <GlyphCircle
                left={selected.xCoordinate}
                top={rdScale(selected.pricePoint.value)}
                size={50}
                fill={theme.accentActive}
                stroke={theme.backgroundOutline}
                strokeWidth={2}
              />
            </g>
          )}
        </Group>
        <rect
          x={0}
          y={0}
          width={width}
          height={graphHeight}
          fill={'transparent'}
          onTouchStart={handleHover}
          onTouchMove={handleHover}
          onMouseMove={handleHover}
          onMouseLeave={() => setSelected(initialState)}
        />
      </svg>
      <TimeOptionsContainer>
        {Object.keys(TIME_DISPLAYS).map((display) => (
          <TimeButton
            key={display}
            active={activeTimePeriod === TIME_DISPLAYS[display]}
            onClick={() => setTimePeriod(TIME_DISPLAYS[display])}
          >
            {display}
          </TimeButton>
        ))}
      </TimeOptionsContainer>
    </ChartWrapper>
  )
}

export default PriceChart
