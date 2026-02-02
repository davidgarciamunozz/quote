import { usePriceItems } from '../hooks/usePriceItems'
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

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([groupType, items]) => (
        <Card key={groupType}>
          <CardHeader>
            <h3 className="text-lg font-semibold capitalize">{groupType}</h3>
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
                      ${item.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
