const renderSection = (icon, h1, h4) => {
    icon = icon || "icarus-terminal-wrench"
    h1 = h1 || "h1 title placeholder"
    h4 = h4 || "h4 title placeholder"
    let section = document.createElement('section')
    section.innerHTML = `<header>
        <div class="icon"><i class="fa ${icon}"></i></div>
        <div class="title">
            <div class="h1">${h1}</div>
            <div class="h4">${h4}</div>
        </div>
        <div class="controls"><span>controls</span><i class="fa fa-caret-right"></i></div>
    </header>
    <div class="content"></div>`
    return section
}

const renderContent = () => {
    let main = document.getElementById("mainContent")

    let cargoSection = renderSection("icarus-terminal-cargo", "Cargo", "Inventory of goods and materials.")
    cargoSection.classList.add("cargo")
    cargoSection.style = "--animation-order: 1"
    main.appendChild(cargoSection)

    let materialsSection = renderSection("icarus-terminal-materials", "Materials", "Inventory of materials")
    materialsSection.classList.add("materials")
    materialsSection.style = "--animation-order: 2"
    main.appendChild(materialsSection)

    let exobiologySection = renderSection("icarus-terminal-plant", "Exobiology", "Catalog of discovered lifeforms")
    exobiologySection.classList.add("exobiology")
    exobiologySection.style = "--animation-order: 3"
    main.appendChild(exobiologySection)

    let systemSection = renderSection("icarus-terminal-system-bodies", "System", "Details of the current system")
    systemSection.classList.add("system")
    systemSection.style = "--animation-order: 4"
    systemSection.querySelector('.content').id = "systemContent"
    main.appendChild(systemSection)

    let footer = document.createElement('footer')
    footer.innerHTML = "Footer"
    main.appendChild(footer)

    return main
}
module.exports = {
    render: renderContent
}