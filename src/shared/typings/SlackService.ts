export interface Label {
  type: string
  text: string
  emoji: boolean
}

export interface TextComponent {
  type: string
  text: string | TextComponent
  emoji?: boolean
}

export interface Option {
  text: TextComponent
  value: string
}

export interface ElementComponent {
  type: string
  options?: Option[]
  action_id: string
  text?: TextComponent
  style?: string
  value?: string
}

export interface Block {
  dispatch_action?: boolean
  type: string
  text?: TextComponent
  element?: ElementComponent
  elements?: ElementComponent[]
  label?: Label
}
