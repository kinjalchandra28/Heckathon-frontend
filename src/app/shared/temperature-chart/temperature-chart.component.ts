import { Component, Input, ElementRef, OnInit, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { GraphData } from './graph.interface';

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css']
})
export class TemperatureChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data!: GraphData;

  private svg: any;
  private margin = { top: 20, right: 40, bottom: 50, left: 60 };
  private width = 0;
  private height = 350;
  private chartInitialized = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chartInitialized) {
      this.updateChart();
    }
  }

  private initChart(): void {
    const container = this.elementRef.nativeElement.querySelector('.chart-container');
    if (!container) return;

    this.width = container.offsetWidth - this.margin.left - this.margin.right;

    // Clear any existing SVG
    d3.select(container).select('svg').remove();

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.chartInitialized = true;
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.svg || !this.data) return;

    // Clear previous content
    this.svg.selectAll('*').remove();

    const seriesKey = Object.keys(this.data.series)[0];
    const seriesData = this.data.series[seriesKey];

    if (!seriesData?.data?.length) return;

    // Parse dates
    const parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S');
    const chartData = seriesData.data.map(d => ({
      date: parseTime(d.x) || new Date(d.x),
      value: d.y
    }));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, this.width]);

    const yScale = d3.scaleLinear()
      .domain([this.data.axis.y.min || -25, this.data.axis.y.max || 75])
      .range([this.height, 0]);

    // Add gradient background
    const gradient = this.svg.append('defs')
      .append('linearGradient')
      .attr('id', 'chart-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#1e3a5f')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0f1c2e')
      .attr('stop-opacity', 0.9);

    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'url(#chart-gradient)');

    // Draw zones (defrost periods)
    if (this.data.zones) {
      Object.values(this.data.zones).forEach(zone => {
        zone.periods.forEach(period => {
          const startDate = parseTime(period.xStart) || new Date(period.xStart);
          const endDate = parseTime(period.xEnd) || new Date(period.xEnd);

          this.svg.append('rect')
            .attr('x', xScale(startDate))
            .attr('y', 0)
            .attr('width', Math.max(0, xScale(endDate) - xScale(startDate)))
            .attr('height', this.height)
            .attr('fill', zone.color);
        });
      });
    }

    // Draw threshold lines
    if (this.data.thresholds) {
      Object.values(this.data.thresholds).forEach(threshold => {
        const y = yScale(threshold.value);
        if (y >= 0 && y <= this.height) {
          this.svg.append('line')
            .attr('x1', 0)
            .attr('x2', this.width)
            .attr('y1', y)
            .attr('y2', y)
            .attr('stroke', threshold.color)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', threshold.style === 'dashed' ? '5,5' : '0');
        }
      });
    }

    // Draw axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d => `${d}°F`);

    this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px');

    this.svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px');

    // Style axis lines
    this.svg.selectAll('.domain').style('stroke', '#475569');
    this.svg.selectAll('.tick line').style('stroke', '#475569');

    // Draw line
    const line = d3.line<{ date: Date; value: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    this.svg.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#FF6B00')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw alerts
    if (this.data.alerts) {
      this.data.alerts.forEach(alert => {
        const alertDate = parseTime(alert.timestamp) || new Date(alert.timestamp);
        const x = xScale(alertDate);
        const y = yScale(alert.value);

        // Alert marker
        this.svg.append('circle')
          .attr('cx', x)
          .attr('cy', this.height + 25)
          .attr('r', 8)
          .attr('fill', '#FF0000');

        this.svg.append('text')
          .attr('x', x)
          .attr('y', this.height + 29)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text('!');
      });
    }
  }
}
