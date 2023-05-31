class BubbleChart {
  constructor(data) {
    this.data = data;
    this.margin = { top: 100, right: 0, bottom: 50, left: 50 };
    this.width = 400 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;
    this.color = d3.scaleOrdinal()
      .domain(this.data.columns.slice(1))
      .range(["#e6194b", "#f58231", "#ffe119", "#bfef45", "#3cb44b", "#42d4f4", "#4363d8", '#911eb4', '#f032e6', '#a9a9a9']);
    this.createChart();
  }

  createChart() {
    const svg = d3.select("#bubblechart_container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `-10 -10 ${this.width + this.margin.left + this.margin.right} ${this.height + this.margin.top + this.margin.bottom}`)
      .attr("preserveAspectRatio", "xMinYMin")
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => +d.male)).nice()
      .range([0, this.width]);

    svg.append('g')
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(xScale).tickSize(0).ticks(5).tickPadding(8).tickFormat(d3.format("~s")))
      .call(d => d.select(".domain").remove());

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => +d.female)).nice()
      .range([this.height, 0]);

    svg.append('g')
      .call(d3.axisLeft(yScale).tickSize(0).ticks(6).tickPadding(4).tickFormat(d3.format("~s")))
      .call(d => d.select(".domain").remove());

    const zScale = d3.scaleSqrt()
      .domain([10, 100000])
      .range([2, 60]);

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    const handleMouseOver = (event, d) => {
      tooltip.style("opacity", 1);
      d3.select(event.target).style("stroke", "#EF4A60").style("opacity", 1);
      updateHistogram(d.occupation); 
    };

                    
    const updateHistogram = (occupation) => {
      d3.select("#histogram_container svg").remove();
    
      const histogramData = this.data.filter((d) => d.occupation === occupation)[0];
    

      const genreCounts = Object.entries(histogramData)
      .filter(
        ([key]) =>
          key !== "occupation" &&
          key !== "male" &&
          key !== "female" &&
          key !== "total"
      )
      .map(([genre, count]) => ({
        genre: genre,
        count: +count,
      }));

      genreCounts.sort((a, b) => b.count - a.count);
      const topGenres = genreCounts.slice(0, 3).map((d) => d.genre);

    
      const histogramMargin = { top: 100, right: 100, bottom: 80, left: 80 };
      const histogramWidth = 600 - histogramMargin.left - histogramMargin.right;
      const histogramHeight = 400 - histogramMargin.top - histogramMargin.bottom;
    
      const xScale = d3
        .scaleBand()
        .domain(genreCounts.map((d) => d.genre))
        .range([0, histogramWidth])
        .padding(0.1);
    
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(genreCounts, (d) => d.count)])
        .range([histogramHeight, 0]);
          
      const histogramSvg = d3
        .select("#histogram_container")
        .append("svg")
        .attr(
          "width",
          histogramWidth + histogramMargin.left + histogramMargin.right
        )
        .attr(
          "height",
          histogramHeight + histogramMargin.top + histogramMargin.bottom
        )
        .append("g")
        .attr(
          "transform",
          `translate(${histogramMargin.left},${histogramMargin.top})`
        );
    
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
      const mousemove = (event, d) => {
        const f = d3.format(",");
        const count = d.count;
        tooltip
          .html(`<div><b>${d.genre}</b><br/><b>Count:</b> ${f(count)}</div>`)
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px")
          .style("opacity", 1);
      };
    
      histogramSvg
      .selectAll("rect.bar")
      .data(genreCounts)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.genre))
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => histogramHeight - yScale(d.count))
      .attr("fill", (d) => (topGenres.includes(d.genre) ? "red" : "#0072BC"))
      .on("mouseover", mousemove)
      .on("mousemove", mousemove)
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });
    
      const xAxis = d3.axisBottom(xScale).tickFormat((d) => {
        return d.split("-").join(" ");
      });
    
      histogramSvg
        .append("g")
        .attr("transform", `translate(0, ${histogramHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("font-size", "10px")
        .append("title")
        .text((d) => d);
    
      const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".2s"));
    
      histogramSvg.append("g").call(yAxis);
    
      histogramSvg
        .append("text")
        .attr("class", "chart-label")
        .attr("x", histogramWidth / 2)
        .attr("y", histogramHeight + histogramMargin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Genre");
    
      histogramSvg
        .append("text")
        .attr("class", "chart-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(histogramHeight / 2))
        .attr("y", -histogramMargin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Counts");
    
      histogramSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", histogramWidth / 2)
        .attr("y", -histogramMargin.top / 2)
        .attr("text-anchor", "middle")
        .text(occupation.toUpperCase());
    
      histogramSvg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -(histogramMargin.left) * 0.5)
        .attr("y", -(histogramMargin.top) / 1.5)
        .attr("text-anchor", "start")
        .text("직업별 선호 장르");

      histogramSvg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-histogramWidth)
          .tickFormat(''));
    };
    
      
    const mousemove = (event, d) => {
      const format = d3.format(",");
      tooltip
        .html(`<div><b>${d.occupation}</b></div><div><b>Total:</b> ${format(d.total)}</div><div><b>Male:</b> ${
          format(d.male)}</div><div><b>Female:</b> ${format(d.female)}</div>`)
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    };

    const handleMouseLeave = (event, d) => {
      tooltip
        .style("opacity", 0);
      d3.select(event.target)
        .style("stroke", "none")
        .style("opacity", 0.5);
    };

    svg.append("g")
      .selectAll
      ("g")
      .data(this.data)
      .join("circle")
      .attr("cx", d => xScale(+d.male))
      .attr("cy", d => yScale(+d.female))
      .attr("r", d => zScale(+d.total))
      .style("fill", d => this.color(d.occupation))
      .style("opacity", 0.6)
      .on("mouseover", handleMouseOver)
      .on("mousemove", mousemove)
      .on("mouseleave", handleMouseLeave);
      svg.append("g")
      .attr("font-size", 10)
      .selectAll("text")
      .data(this.data)
      .join("text")
      .attr("dy", "0.35em")
      .attr("x", d => xScale(+d.male) + 15)
      .attr("y", d => yScale(+d.female))
      // .text(d => d.occupation);
    
    svg.append("text")
      .attr("class", "chart-title")
      .attr("x", -(this.margin.left) * 0.5)
      .attr("y", -(this.margin.top) / 1.5)
      .attr("text-anchor", "start")
      .text("영화 관람객의 직업");
    
    svg.append("text")
      .attr("class", "chart-label")
      .attr("x", this.width / 1.7)
      .attr("y", this.height + this.margin.bottom * 0.6)
      .attr("text-anchor", "middle")
      .text("Number of Male");
    
    svg.append("text")
      .attr("class", "chart-label")
      .attr("x", -(this.margin.left) * 0.5)
      .attr("y", -(this.margin.top / 8))
      .attr("text-anchor", "start")
      .text("Number of Female");

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-this.height)
        .tickFormat(''));
  
    // Add gridlines to the y-axis
    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-this.width)
        .tickFormat(''));
      
    }
  }


d3.csv("https://raw.githubusercontent.com/kookeej/infovis/master/movie_occupation_genre_cnt.csv")
.then(function (data) {
const bubbleChart = new BubbleChart(data);
});