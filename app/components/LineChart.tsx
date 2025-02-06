"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface LineChartProps {
  data: {
    retailer: number[]
    incomingOrder: number[]
    expiringBeer: number[]
    backlog: number[]
    lostOrders: number[]
    marketingWeeks: number[]
  }
}

export function LineChart({ data }: LineChartProps) {
  const chartData = {
    labels: data.retailer.map((_, index) => `Semana ${index + 1}`),
    datasets: [
      {
        label: "Estoque do Varejista",
        data: data.retailer,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Pedidos Recebidos",
        data: data.incomingOrder,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: "Cerveja Vencida",
        data: data.expiringBeer,
        borderColor: "rgb(255, 159, 64)",
        tension: 0.1,
      },
      {
        label: "Pedidos em Atraso",
        data: data.backlog,
        borderColor: "rgb(153, 102, 255)",
        tension: 0.1,
      },
      {
        label: "Pedidos Perdidos",
        data: data.lostOrders,
        borderColor: "rgb(201, 203, 207)",
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Desempenho do Varejista",
      },
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            const weekIndex = context[0].dataIndex
            if (data.marketingWeeks.includes(weekIndex + 1)) {
              return "Campanha de Marketing nesta semana!"
            }
            return ""
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (value: any, index: number) {
            if (data.marketingWeeks.includes(index + 1)) {
              return "📢 " + this.getLabelForValue(value)
            }
            return this.getLabelForValue(value)
          },
        },
      },
    },
  }

  return <Line options={options} data={chartData} />
}

