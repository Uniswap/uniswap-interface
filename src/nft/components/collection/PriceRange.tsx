import { useIsMobile } from 'nft/hooks'
import { FocusEventHandler, FormEvent, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useCollectionFilters } from '../../hooks/useCollectionFilters'
import { isNumber } from '../../utils/numbers'
import { scrollToTop } from '../../utils/scrollToTop'
import { Row } from '../Flex'
import { NumericInput } from '../layout/Input'

export const PriceRange = () => {
  const [placeholderText, setPlaceholderText] = useState('')
  const setMinPrice = useCollectionFilters((state) => state.setMinPrice)
  const setMaxPrice = useCollectionFilters((state) => state.setMaxPrice)
  const minPrice = useCollectionFilters((state) => state.minPrice)
  const maxPrice = useCollectionFilters((state) => state.maxPrice)
  const isMobile = useIsMobile()

  const location = useLocation()

  useEffect(() => {
    setMinPrice('')
    setMaxPrice('')
  }, [location.pathname, setMinPrice, setMaxPrice])

  const handleFocus: FocusEventHandler<HTMLInputElement> = (e) => {
    setPlaceholderText(e.currentTarget.placeholder)
    e.currentTarget.placeholder = ''
  }

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    e.currentTarget.placeholder = placeholderText
    setPlaceholderText('')
  }

  return (
    <Row gap="12" marginTop="12" color="textPrimary">
      <Row position="relative" style={{ flex: 1 }}>
        <NumericInput
          style={{
            width: isMobile ? '100%' : '142px',
            border: '2px solid rgba(153, 161, 189, 0.24)',
          }}
          borderRadius="12"
          padding="12"
          fontSize="14"
          color={{ placeholder: 'textSecondary', default: 'textPrimary' }}
          backgroundColor="transparent"
          placeholder="Min"
          defaultValue={minPrice}
          onChange={(v: FormEvent<HTMLInputElement>) => {
            scrollToTop()
            setMinPrice(isNumber(v.currentTarget.value) ? parseFloat(v.currentTarget.value) : '')
          }}
          onFocus={handleFocus}
          value={minPrice}
          onBlur={handleBlur}
        />
      </Row>
      <Row position="relative" style={{ flex: 1 }}>
        <NumericInput
          style={{
            width: isMobile ? '100%' : '142px',
            border: '2px solid rgba(153, 161, 189, 0.24)',
          }}
          borderColor={{ default: 'stateOverlayHover', focus: 'textSecondary' }}
          borderRadius="12"
          padding="12"
          fontSize="14"
          color={{ placeholder: 'textSecondary', default: 'textPrimary' }}
          backgroundColor="transparent"
          placeholder="Max"
          defaultValue={maxPrice}
          value={maxPrice}
          onChange={(v: FormEvent<HTMLInputElement>) => {
            scrollToTop()
            setMaxPrice(isNumber(v.currentTarget.value) ? parseFloat(v.currentTarget.value) : '')
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Row>
    </Row>
  )
}
