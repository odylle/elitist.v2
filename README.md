## Events

### Cargo
### FSDTarget
### FSDJump
    - set session.location
    - store System in DB
    - store Body in DB
    - callback: updateCurrentLocation

### FSSAllBodiesFound
    - callback: sendNotification, data: FSSAllBodiesFound

### FSSBodySignals
### Loadout
### Location
    - set session.location
    - store System in DB
    - store Body in DB
    - callback: updateCurrentLocation

### Scan
    - store Body in DB
    - callback: addBodyElement

### SAASignalsFound
### ScanOrganic
### Shutdown

## Functions
#### updateCurrentLocation()
    - clearBodiesElement()
    - getSystem(session.location.address)
    - getBodies(session.location.address)
        - checkForSignals(session.location.address)
    - updateSystemElement(system)
    - updateBodiesElement(bodies)

#### addBodyElement(address, id)
    - get Body from DB
    - addBodyElement(body)

