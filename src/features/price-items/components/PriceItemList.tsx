import { usePriceItems } from '../hooks/usePriceItems'
import { GROUP_LABELS, type PriceItemGroupType } from '../types'
import { formatPriceCOP, copToUsd, formatPriceUSD } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DEFAULT_EXCHANGE_RATE = 3500

export function PriceItemList() {
  const { priceItems, loading, error } = usePriceItems()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading price items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  const groupedItems = priceItems.reduce((acc, item) => {
    if (!acc[item.group_type]) {
      acc[item.group_type] = []
    }
    acc[item.group_type].push(item)
    return acc
  }, {} as Record<string, typeof priceItems>)

  const groupOrder: PriceItemGroupType[] = ['clinic', 'laboratory', 'implantologist', 'periodontist', 'endodontist', 'logistics', 'extra']

  return (
    <div className="space-y-6">
      {groupOrder.filter((g) => groupedItems[g]).map((groupType) => {
        const items = groupedItems[groupType]
        return (
        <Card key={groupType}>
          <CardHeader>
            <h3 className="text-lg font-semibold">{GROUP_LABELS[groupType]}</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      <span>{formatPriceCOP(item.price)}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({formatPriceUSD(copToUsd(item.price, DEFAULT_EXCHANGE_RATE))})
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        )
      })}
    </div>
  )
}
