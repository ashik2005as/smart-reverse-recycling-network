import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register all Chart.js components once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'top', labels: { font: { family: 'Inter' } } },
    title: { display: false },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.05)' } },
    y: { grid: { color: 'rgba(0,0,0,0.05)' } },
  },
}

/**
 * Reusable chart widget.
 * Props: title, type ('line'|'bar'|'doughnut'), data, options, height
 */
function ChartWidget({ title, type = 'line', data, options = {}, height = 260 }) {
  const mergedOptions = { ...defaultOptions, ...options }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={mergedOptions} height={height} />
      case 'doughnut':
        return <Doughnut data={data} options={{ ...mergedOptions, scales: undefined }} height={height} />
      default:
        return <Line data={data} options={mergedOptions} height={height} />
    }
  }

  return (
    <div className="card">
      {title && <div className="card-title">{title}</div>}
      <div style={{ position: 'relative' }}>
        {renderChart()}
      </div>
    </div>
  )
}

export default ChartWidget
