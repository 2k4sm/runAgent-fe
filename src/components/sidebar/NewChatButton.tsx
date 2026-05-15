import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConversationStore } from '@/stores/conversationStore'
import { ROUTES } from '@/lib/constants'

/** Clears the active conversation and navigates to a fresh chat. */
export function NewChatButton() {
  const navigate = useNavigate()
  const selectConversation = useConversationStore((s) => s.selectConversation)

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => {
        selectConversation(null)
        navigate(ROUTES.CHAT)
      }}
    >
      <Plus />
      New chat
    </Button>
  )
}
