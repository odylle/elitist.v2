const helpers = require('../helpers')

const baseSection = () => {
    let section = document.createElement('section')
    section.innerHTML = `<header>
        <div class="icon"><i class="fa icarus-terminal-wrench"></i></div>
        <div class="title">
            <div class="h1"></div>
            <div class="h4"></div>
        </div>
        <div class="controls"></div>
    </header>
    <div class="content"></div>`
    return section
}

// const navigationControls = (parent) => {
//     // Checkbox
//     parent.querySelector("i").classList.contains("fa-square")
//       ? parent
//           .querySelector("i")
//           .classList.replace("fa-square", "fa-check-square")
//       : parent
//           .querySelector("i")
//           .classList.replace("fa-check-square", "fa-square");
//     // Content
//     let content = document.querySelector('.navigation .content')
//     if (content.children.length > 0) {
//         content.querySelectorAll('.common').forEach((element) => {
//             element.style.display = element.style.display === 'none' ? 'flex' : 'none'
            
//         })
//     }
// }

const systemControls = (parent) => {
    // Checkbox
    parent.querySelector("i").classList.contains("fa-square")
      ? parent
          .querySelector("i")
          .classList.replace("fa-square", "fa-check-square")
      : parent
          .querySelector("i")
          .classList.replace("fa-check-square", "fa-square");
    // Content
    let content = document.querySelector('.system .content .bodies')
    if (content.children.length > 0) {
        content.querySelectorAll('.common').forEach((element) => {
            // element.style.display = element.style.display === 'none' ? 'flex' : 'none'
            element.classList.toggle('hide')
        })
    }
}


const mainSections = async () => {
    let main = document.getElementById('mainContent')
    // Add Cargo
    let cargoSection = baseSection()
    cargoSection.classList.add('cargo')
    cargoSection.querySelector('.h1').innerText = "Cargo"
    cargoSection.querySelector('.h4').id = "cargoSubtext"
    cargoSection.querySelector('.h4').innerHTML = subText.cargo()
    cargoSection.querySelector('.icon').innerHTML = `<i class="fa icarus-terminal-cargo"></i>`
    cargoSection.querySelector('.controls').innerHTML = `controls`
    main.append(cargoSection)

    // Add Materials
    let materialsSection = baseSection()
    materialsSection.classList.add('materials')
    materialsSection.querySelector('.h1').innerText = "Materials"
    materialsSection.querySelector('.h4').innerText = "No Materials Collected"
    materialsSection.querySelector('.icon').innerHTML = `<i class="fa icarus-terminal-materials"></i>`
    materialsSection.querySelector('.controls').innerHTML = `controls`
    main.append(materialsSection)

    // Add Exobiology
    let exobiologySection = baseSection()
    exobiologySection.classList.add('exobiology')
    exobiologySection.querySelector('.h1').innerText = "Exobiology"
    exobiologySection.querySelector('.h4').innerText = "No Samples Collected"
    exobiologySection.querySelector('.icon').innerHTML = `<i class="fa icarus-terminal-plant"></i>`
    exobiologySection.querySelector('.controls').innerHTML = `controls`
    main.append(exobiologySection)

    // Add System
    let systemSection = baseSection()
    systemSection.classList.add('system')
    systemSection.querySelector('.h1').innerHTML = `System <span id='systemName'>${await subText.systemName()}</span>`
    systemSection.querySelector('.h4').innerHTML = await subText.systemBodies()
    systemSection.querySelector('.icon').innerHTML = `<i class="fa icarus-terminal-system-bodies"></i>`
    systemSection.querySelector('.controls').innerHTML = `<span>show Only interesting Bodies</span><i class="far fa-square"></i>`
    systemSection.querySelector('.controls').addEventListener('click', (event) => {
        let parent = systemSection.querySelector('.controls')
        systemControls(parent)
    })
    systemSection.querySelector('.content').id = "systemContent"
    main.append(systemSection)

    // The Footer will be used as a notification center
    let footer = document.createElement('footer')
    footer.id = "notificationCenter"
    main.append(footer)
}

const subText = {
    cargo: () => {
        let cargo = store.get('session.cargo')
        if (cargo.capacity == 0) return "No Cargospace available"
        let full = cargo.count == cargo.capacity ? 'full' : 'available'
        return `<span class="cargo-space ${full}">${cargo.count}/${cargo.capacity} available</span>`
    },
    // navigation: () => {
    //     let route = store.get('session.route')
    //     if (!route || route.length == 0) return "No Route Found"
    //     return `${route.length} jumps remaining`
    // },
    systemName: async () => {
        let system = await db.systems.get(store.get('session.location.address'))
        return system.name
    },
    systemBodies: async () => {
        return helpers.getBodiesSummary(store.get("session.location.address"))
    }
}

module.exports = { mainSections, mainSubtext: subText }