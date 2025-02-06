import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RankingProps {
  ranking: { name: string; score: number }[]
}

export function Ranking({ ranking }: RankingProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Ranking</h2>
      <p className="text-sm text-gray-600 mb-4">
        Este ranking mostra os 5 melhores resultados. A pontuação é baseada no lucro total do varejista após 26 semanas,
        refletindo o equilíbrio alcançado entre o gerenciamento de estoque e a satisfação dos pedidos.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Posição</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Lucro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell>R$ {entry.score.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

