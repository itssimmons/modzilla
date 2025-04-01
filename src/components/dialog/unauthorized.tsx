'use client'

import { Button, CloseButton, Dialog, Input, Portal } from '@chakra-ui/react'

import { Field } from '@/components/ui/field'

export default function Unauthorized() {
  const logIn = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()

    const form = ev.currentTarget
    const data = new FormData(form)
    const credentials: { username: string } = Object.fromEntries(
      data
    ) as unknown as { username: string }

    location.replace(`/?username=${credentials.username}`)
  }

  return (
    <Dialog.Root open>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header />
            <Dialog.Body>
              <Dialog.Title>User unauthorized ⚠️</Dialog.Title>
              <Dialog.Description mb='4'>
                Hey there, sadly you are not authorized to access this page.
                Please authenticate to start chatting by filling out the form.
              </Dialog.Description>

              <form id='login-form' onSubmit={logIn}>
                <Field label='Username'>
                  <Input
                    type='text'
                    name='username'
                    placeholder='johndoe_007'
                  />
                </Field>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant='outline'>Cancel</Button>
              </Dialog.ActionTrigger>
              <Button type='submit' form='login-form'>
                Log In
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
