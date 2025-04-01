'use client'

import { Dialog, Portal, Progress } from '@chakra-ui/react'

export default function Connecting() {
  return (
    <Dialog.Root open>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Body pt={5}>
              <Dialog.Title>Establishing connection 🚀</Dialog.Title>
              <Dialog.Description>
                Please be patient, this may take a few seconds.
              </Dialog.Description>

              <Progress.Root mt={4} maxW='full' size='xs' variant="outline" value={null}>
                <Progress.Track  >
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
