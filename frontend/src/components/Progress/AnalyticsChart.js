// src/components/Progress/AnalyticsChart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './AnalyticsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsChart({ data, type = 'line' }) {
  if (!data || !data.labels || !data.data || data.data.length === 0) {
    return (
      <div className="chart-empty">
        <span className="empty-chart-icon">📊</span>
        <p>No data available yet. Complete some exams to see your progress!</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: type === 'line' ? 'Performance Score' : 'Accuracy %',
        data: data.data,
        fill: type === 'line',
        backgroundColor: type === 'line' 
          ? 'rgba(99, 102, 241, 0.1)'
          : [
              'rgba(99, 102, 241, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(16, 185, 129, 0.8)'
            ],
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: type === 'line' ? 3 : 0,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: type === 'line' ? 5 : 0,
        pointHoverRadius: type === 'line' ? 7 : 0,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderColor: '#6366f1',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: function(context) {
            return type === 'line' 
              ? `Score: ${Math.round(context.parsed.y)}`
              : `Accuracy: ${Math.round(context.parsed.y)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280',
          callback: function(value) {
            return type === 'bar' ? value + '%' : value;
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  };

  return (
    <div className="chart-wrapper-enhanced">
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}

export default AnalyticsChart;