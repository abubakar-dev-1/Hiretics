export type CardComponentProps = {
    title?: string
    status?: "completed" | "ongoing" | "archived" | "not-started"
    username?: string
    userAvatar?: string
    count?: number
    highlight?: boolean
    actions?: React.ReactNode
    footer?: React.ReactNode
    variant?: "default" | "create" | "skeleton" | "trash"
    onClick?: () => void
    className?: string
    isFavorite?: boolean
    onFavorite?: () => void
    onOptions?: () => void
    onEdit?: () => void
    onArchive?: () => void
    onCopyLink?: () => void
    onRestore?: () => void
    onDeletePermanently?: () => void
    isSelected?: boolean
    onSelectToggle?: (selected: boolean) => void
  }
