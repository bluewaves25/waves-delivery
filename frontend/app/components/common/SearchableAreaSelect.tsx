import { useQuery } from 'react-query'
import { getServiceAreaTree } from '~/utils/merchant/CSR_API'
import type { SearchableSelectOptionsType } from './SearchableSelectInput'
import SearchableSelect from './SearchableSelectInput'
import type { SingleValue } from 'chakra-react-select'
import React from 'react'

type SearchableAreaSelectProps = {
    name: string | undefined
    defaultValue?: SearchableSelectOptionsType
    preferredDivision?: string | null
    onChange?: (e: SingleValue<SearchableSelectOptionsType>) => void
}

function SearchableAreaSelect({
    name,
    defaultValue,
    preferredDivision,
    onChange,
}: SearchableAreaSelectProps) {
    const { data: serviceArea, isLoading } = useQuery({
        queryKey: 'serviceArea',
        queryFn: () => getServiceAreaTree(),
    })

    const pickupAreaOptions = React.useMemo(() => {
        const options: Array<SearchableSelectOptionsType> = []
        if (isLoading) return options

        serviceArea?.data?.divisions.forEach((div) => {
            div?.districts?.forEach((dis) => {
                dis?.areas?.forEach((area) => {
                    options.push({
                        label: `${div.name} - ${dis.name} - ${area.name}`,
                        value: area.id.toString(),
                        area: area.name,
                        zoneId: area.zonesId,
                        division: div.name,
                    })
                })
            })
        })

        if (preferredDivision) {
            options.sort((a, b) => {
                const aMatch = a.division === preferredDivision ? 0 : 1
                const bMatch = b.division === preferredDivision ? 0 : 1
                return aMatch - bMatch
            })
        }
        return options
    }, [isLoading, preferredDivision, serviceArea?.data?.divisions])

    return (
        <SearchableSelect
            key={defaultValue?.value || preferredDivision || 'area'}
            options={pickupAreaOptions}
            name={name}
            defaultValue={defaultValue}
            onChange={onChange}
        />
    )
}

export default SearchableAreaSelect
