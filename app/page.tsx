"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart } from "./components/LineChart"
import { Ranking } from "./components/Ranking"

interface GameState {
  week: number
  retailer: number
  wholesaler: number
  distributor: number
  factory: number
  backlog: number
  incomingOrder: number
  expiringBeer: number
  lostOrders: number
  marketingCampaign: boolean
  salesIncrease: number
  totalRevenue: number
  totalCost: number
  history: {
    retailer: number[]
    incomingOrder: number[]
    expiringBeer: number[]
    backlog: number[]
    lostOrders: number[]
    marketingWeeks: number[]
  }
}

const BEER_PRICE = 5 // Preço de venda por unidade
const STORAGE_COST = 0.5 // Custo de armazenamento por unidade por semana
const INITIAL_STOCK = 8 // Estoque inicial reduzido
const BACKLOG_LIMIT = 2 // Limite de semanas para pedidos em atraso

const initialGameState: GameState = {
  week: 1,
  retailer: INITIAL_STOCK,
  wholesaler: INITIAL_STOCK,
  distributor: INITIAL_STOCK,
  factory: INITIAL_STOCK,
  backlog: 0,
  incomingOrder: 4,
  expiringBeer: 0,
  lostOrders: 0,
  marketingCampaign: false,
  salesIncrease: 0,
  totalRevenue: 0,
  totalCost: 0,
  history: {
    retailer: [INITIAL_STOCK],
    incomingOrder: [4],
    expiringBeer: [0],
    backlog: [0],
    lostOrders: [0],
    marketingWeeks: [],
  },
}

export default function BeerGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [order, setOrder] = useState<number>(4)
  const [ranking, setRanking] = useState<{ name: string; score: number }[]>([])
  const [playerName, setPlayerName] = useState<string>("")
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameEnded, setGameEnded] = useState<boolean>(false)
  const [newPlayerName, setNewPlayerName] = useState<string>("")

  useEffect(() => {
    const savedRanking = localStorage.getItem("beerGameRanking")
    if (savedRanking) {
      setRanking(JSON.parse(savedRanking))
    }
  }, [])

  useEffect(() => {
    if (gameState.week % 4 === 0) {
      const willHaveCampaign = Math.random() < 0.5
      if (willHaveCampaign) {
        const increase = Math.floor(Math.random() * 3) + 1 // 1-3
        setGameState((prevState) => ({
          ...prevState,
          marketingCampaign: true,
          salesIncrease: increase,
          history: {
            ...prevState.history,
            marketingWeeks: [...prevState.history.marketingWeeks, prevState.week],
          },
        }))
      }
    }
  }, [gameState.week])

  const placeOrder = () => {
    if (gameState.week >= 26) {
      const finalScore = gameState.totalRevenue - gameState.totalCost
      const newRanking = [...ranking, { name: playerName, score: finalScore }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
      setRanking(newRanking)
      localStorage.setItem("beerGameRanking", JSON.stringify(newRanking))
      setGameEnded(true)
      return
    }

    setGameState((prevState) => {
      const baseIncomingOrder = Math.floor(Math.random() * 11) // Random demand between 0-10
      const campaignIncrease = prevState.marketingCampaign ? prevState.salesIncrease : 0
      const newIncomingOrder = baseIncomingOrder + campaignIncrease

      const totalDemand = newIncomingOrder + prevState.backlog
      const soldBeer = Math.min(prevState.retailer, totalDemand)
      const newRevenue = soldBeer * BEER_PRICE

      const newRetailer = prevState.retailer + prevState.wholesaler - soldBeer
      const newWholesaler = prevState.distributor
      const newDistributor = prevState.factory
      const newFactory = order
      const newBacklog = Math.max(0, totalDemand - soldBeer)

      // Calculate expiring beer (10% chance for each unit to expire)
      const expiringBeer = Math.floor(newRetailer * 0.1)

      // Calculate lost orders (orders in backlog for more than BACKLOG_LIMIT weeks)
      const lostOrders = prevState.week >= BACKLOG_LIMIT ? prevState.history.backlog[prevState.week - BACKLOG_LIMIT] : 0

      // Calculate storage cost
      const storageCost = (newRetailer + newWholesaler + newDistributor + newFactory) * STORAGE_COST

      return {
        ...prevState,
        week: prevState.week + 1,
        retailer: Math.max(0, newRetailer - expiringBeer),
        wholesaler: newWholesaler,
        distributor: newDistributor,
        factory: newFactory,
        backlog: newBacklog,
        incomingOrder: newIncomingOrder,
        expiringBeer: expiringBeer,
        lostOrders: prevState.lostOrders + lostOrders,
        marketingCampaign: false,
        salesIncrease: 0,
        totalRevenue: prevState.totalRevenue + newRevenue,
        totalCost: prevState.totalCost + storageCost,
        history: {
          retailer: [...prevState.history.retailer, Math.max(0, newRetailer - expiringBeer)],
          incomingOrder: [...prevState.history.incomingOrder, newIncomingOrder],
          expiringBeer: [...prevState.history.expiringBeer, expiringBeer],
          backlog: [...prevState.history.backlog, newBacklog],
          lostOrders: [...prevState.history.lostOrders, lostOrders],
          marketingWeeks: prevState.history.marketingWeeks,
        },
      }
    })
  }

  const startNewGame = () => {
    const nameToUse = gameEnded ? newPlayerName : playerName
    if (nameToUse.trim() === "") {
      alert("Por favor, insira seu nome antes de começar o jogo.")
      return
    }
    setGameState(initialGameState)
    setOrder(4)
    setGameStarted(true)
    setGameEnded(false)
    setPlayerName(nameToUse)
    setNewPlayerName("")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Beer Game</h1>
      {!gameStarted && !gameEnded ? (
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Seu nome"
            className="w-64"
          />
          <Button onClick={startNewGame}>Começar Novo Jogo</Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl mb-4">Semana {gameState.week}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Varejista: {gameState.retailer}</p>
                <p>Atacadista: {gameState.wholesaler}</p>
                <p>Distribuidor: {gameState.distributor}</p>
                <p>Fábrica: {gameState.factory}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Pedido recebido: {gameState.incomingOrder}</p>
                <p>Pedidos em atraso: {gameState.backlog}</p>
                <p>Cerveja vencida: {gameState.expiringBeer}</p>
                <p>Pedidos perdidos: {gameState.lostOrders}</p>
                <p>Receita total: R$ {gameState.totalRevenue.toFixed(2)}</p>
                <p>Custo total: R$ {gameState.totalCost.toFixed(2)}</p>
                <p>Lucro: R$ {(gameState.totalRevenue - gameState.totalCost).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>
          {gameState.marketingCampaign && (
            <Alert className="mb-4">
              <AlertTitle>Campanha de Marketing!</AlertTitle>
              <AlertDescription>
                A equipe de marketing está planejando uma campanha que pode aumentar as vendas em até{" "}
                {gameState.salesIncrease} unidades!
              </AlertDescription>
            </Alert>
          )}
          {!gameEnded && (
            <div className="flex items-center gap-4 mb-4">
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
                className="w-24"
              />
              <Button onClick={placeOrder} disabled={gameState.week > 26}>
                Fazer Pedido
              </Button>
            </div>
          )}
          <LineChart data={gameState.history} />
        </>
      )}
      {(gameEnded || ranking.length > 0) && <Ranking ranking={ranking} />}
      {gameEnded && (
        <div className="flex items-center gap-4 mt-4">
          <Input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nome do novo jogador"
            className="w-64"
          />
          <Button onClick={startNewGame}>Jogar Novamente</Button>
        </div>
      )}
    </div>
  )
}

