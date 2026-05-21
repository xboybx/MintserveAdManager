'use client';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function DashboardChart({ dailyData = [] }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart instance to prevent memory leaks/multiple renders
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // Sort dailyData by date ascending
    const sortedData = [...dailyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Format dates to human-friendly shorthand (e.g. "May 12")
    const labels = sortedData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    });

    const impressionsData = sortedData.map(d => d.impressions);
    const clicksData = sortedData.map(d => d.clicks);

    // Create area gradients for impressions and clicks
    const impGradient = ctx.createLinearGradient(0, 0, 0, 300);
    impGradient.addColorStop(0, 'rgba(26, 115, 232, 0.18)');
    impGradient.addColorStop(1, 'rgba(26, 115, 232, 0.00)');

    const clicksGradient = ctx.createLinearGradient(0, 0, 0, 300);
    clicksGradient.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    clicksGradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Impressions',
            data: impressionsData,
            borderColor: '#1a73e8',
            backgroundColor: impGradient,
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            yAxisID: 'y',
            pointBackgroundColor: '#1a73e8',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#1a73e8',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
          },
          {
            label: 'Clicks',
            data: clicksData,
            borderColor: '#10b981',
            backgroundColor: clicksGradient,
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            yAxisID: 'y1',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#10b981',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: 'Roboto, sans-serif',
                size: 12,
                weight: '500'
              },
              color: '#3c4043',
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            titleColor: '#202124',
            bodyColor: '#3c4043',
            borderColor: '#dadce0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            titleFont: {
              family: 'Roboto, sans-serif',
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              family: 'Roboto, sans-serif',
              size: 12
            },
            shadowColor: 'rgba(0, 0, 0, 0.08)',
            shadowBlur: 8,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString();
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#5f6368',
              font: {
                family: 'Roboto, sans-serif',
                size: 11
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: '#f1f3f4',
              drawBorder: false
            },
            ticks: {
              color: '#5f6368',
              font: {
                family: 'Roboto, sans-serif',
                size: 11
              },
              callback: (value) => value.toLocaleString()
            },
            title: {
              display: true,
              text: 'Impressions',
              color: '#1a73e8',
              font: {
                family: 'Roboto, sans-serif',
                size: 11,
                weight: '500'
              }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false, // only show horizontal gridlines for y
            },
            ticks: {
              color: '#5f6368',
              font: {
                family: 'Roboto, sans-serif',
                size: 11
              },
              callback: (value) => value.toLocaleString()
            },
            title: {
              display: true,
              text: 'Clicks',
              color: '#10b981',
              font: {
                family: 'Roboto, sans-serif',
                size: 11,
                weight: '500'
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dailyData]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
