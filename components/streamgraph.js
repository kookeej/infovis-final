class StreamGraph {
  constructor(containerId) {
    this.margin = { top: 100, right: 20, bottom: 50, left: 40 };
    this.width = 450 - this.margin.left - this.margin.right;
    this.height = 350 - this.margin.top - this.margin.bottom;
    this.containerId = containerId;
  }

  createSVG() {
    this.svg = d3
      .select(`#${this.containerId}`)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", "0 0 450 350")
      .attr("preserveAspectRatio", "xMinYMin")
      .append("g")
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top})`
      );
  }

  loadData() {
    return d3.csv(
      "https://raw.githubusercontent.com/kookeej/infovis/master/movie_gender_cnt.csv"
    );
  }

  createStackedData(data) {
    const genderKeys = data.columns.slice(1, 3);
    const ageKeys = data.map((d) => d.age);

    const stack = d3
      .stack()
      .keys(genderKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    return stack(data);
  }

  createXScale(ageKeys) {
    this.xScale = d3
      .scalePoint()
      .domain(ageKeys)
      .range([0, this.width])
      .padding(0);
    this.svg
      .append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.xScale).tickSize(0).tickPadding(8));
  }

  createYScale() {
    this.yScale = d3.scaleLinear().domain([0, 45000]).range([this.height, 0]);
    this.svg
      .append("g")
      .call(d3.axisLeft(this.yScale).ticks(9).tickSize(0).tickPadding(6))
      .call((d) => d.select(".domain").remove());
  }

  createColorScale(genderKeys) {
    this.color = d3
      .scaleOrdinal()
      .domain(genderKeys)
      .range(["#0072BC", "#ff6666"]);
  }

  createGridLine() {
    const GridLine = () => d3.axisLeft().scale(this.yScale);
    this.svg
      .append("g")
      .attr("class", "grid")
      .call(
        GridLine().tickSize(-this.width, 0, 0).tickFormat("")
      );
  }

  createTooltip() {
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip");
  }

  mousemove(event, d) {
    let gender;
    if (d.key === "man") {
      gender = "Male";
    } else {
      gender = "Female";
    }
    this.tooltip
      .html(gender)
      .style("top", event.pageY - 10 + "px")
      .style("left", event.pageX + 10 + "px");
  }

  mouseover(event, d) {
    this.tooltip.style("opacity", 0.8);
    d3.select(event.currentTarget).style("opacity", 0.5);
  }

  mouseleave(event, d) {
    this.tooltip.style("opacity", 0);
    d3.select(event.currentTarget).style("opacity", 1);
  }
  
  createStreamPaths(stackedData) {
    this.svg
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .join("path")
      .attr("fill", (d) => this.color(d.key))
      .attr("d", d3.area()
        .x((d) => this.xScale(d.data.age))
        .y0((d) => this.yScale(+d[0]))
        .y1((d) => this.yScale(+d[1]))
      )
      .attr("width", this.xScale.bandwidth())
      .attr("height", (d) => this.yScale(d[0]) - this.yScale(d[1]))
      .on("mouseover", (event, d) => {
        this.mouseover(event, d);
      })
      .on("mousemove", (event, d) => {
        this.mousemove(event, d);
      })
      .on("mouseleave", (event, d) => {
        this.mouseleave(event, d);
      });
  }
  
  setTitle(title) {
  this.svg
  .append("text")
  .attr("class", "chart-title")
  .attr("x", -(this.margin.left) * 0.6)
  .attr("y", -(this.margin.top) / 1.5)
  .attr("text-anchor", "start")
  .text(title);
  }
  
  setYAxisLabel(label) {
  this.svg
  .append("text")
  .attr("class", "chart-label")
  .attr("x", -(this.margin.left) * 0.6)
  .attr("y", -(this.margin.top / 8))
  .attr("text-anchor", "start")
  .text(label);
  }
  
  createLegend() {
      this.svg
      .append("rect")
      .attr("x", -(this.margin.left) * 0.6)
      .attr("y", -(this.margin.top / 2))
      .attr("width", 13)
      .attr("height", 13)
      .style("fill", "#0072BC");
      this.svg
      .append("text")
      .attr("class", "legend")
      .attr("x", -(this.margin.left) * 0.6 + 20)
      .attr("y", -(this.margin.top / 2.5))
      .text("Male");
      this.svg
      .append("rect")
      .attr("x", 60)
      .attr("y", -(this.margin.top / 2))
      .attr("width", 13)
      .attr("height", 13)
      .style("fill", "#ff6666");
      this.svg
      .append("text")
      .attr("class", "legend")
      .attr("x", 80)
      .attr("y", -(this.margin.top / 2.5))
      .text("Female");
  } 
  
  render() {
    this.createSVG();
    const self = this; 
    this.loadData().then(function (data) {
      const stackedData = self.createStackedData(data);
      const ageKeys = data.map((d) => d.age);
  
      self.createXScale(ageKeys);
      self.createYScale();
      self.createColorScale(stackedData.map((d) => d.key));
      self.createGridLine();
      self.createTooltip();
      self.createStreamPaths(stackedData);
      self.setTitle("연령대별 영화 관람객 수");
      self.setYAxisLabel("Number");
      self.createLegend();
    });
  }

}

const streamGraph = new StreamGraph("streamgraph_container");
streamGraph.render();

