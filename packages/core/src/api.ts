export interface ApiDefinition{
    name: string
    inputs: ApiChannel[]
    outputs: ApiChannel[],
    type: string
}

export interface ApiChannel{
    name: string
    type?: string
}