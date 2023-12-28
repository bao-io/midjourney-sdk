import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'

export default function MjModal({
  show,
  setOpen,
  title,
  panelClass,
  fullscreen,
  children
}: {
  show: boolean
  setOpen: (val: boolean) => void
  title: string
  panelClass?: string
  fullscreen?: boolean
  children: React.ReactNode
}) {
  return (
    <Transition.Root appear show={show} as={Fragment}>
      <Dialog
        unmount={false}
        open={show}
        onClose={setOpen}
        className="relative z-50"
      >
        <Transition.Child
          as={Fragment}
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div
            className={clsx(
              'flex min-h-full justify-center',
              fullscreen ? 'h-full items-stretch' : 'p-4 items-center'
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="duration-300 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'bg-white p-6 shadow-xl transition-all w-full flex flex-col gap-2 overflow-hidden',
                  !fullscreen && 'rounded-md',
                  panelClass
                )}
              >
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between z-50">
                  <span>{title}</span>
                  <XMarkIcon
                    className="w-5 h-5"
                    onClick={() => setOpen(false)}
                  />
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
