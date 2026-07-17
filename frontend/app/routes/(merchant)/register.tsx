import type { ApiErrorResponse } from '~/types'
import type {
    ActionFunction,
    LoaderFunction,
    MetaFunction,
} from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Box } from '@chakra-ui/react'
import LoginRegLeftSide from '~/components/common/loginRegLeftSide'
import Layout from '~/components/Layout'
import DemoCredentials from '~/components/common/DemoCredentials'
import RegisterForm from '~/components/merchant/RegisterForm'
import { validateEmail, validatePassword, badRequest } from '~/utils'
import { getUserId, register } from '~/utils/session.server'
import { useActionData, useTransition } from '@remix-run/react'

export const meta: MetaFunction = () => ({
    title: 'Sign up to send — SendGH',
})

function validateConfirmPassword({
    password,
    confirmPassword,
}: {
    password: string
    confirmPassword: string
}) {
    if (password !== confirmPassword) return "Confirm Password didn't match"
}

export type ActionData = {
    formError?: string
    formSuccess?: {
        message: string
    }
    fieldErrors?: {
        email?: string | undefined
        password?: string | undefined
        confirmPassword?: string | undefined
        shopEmail?: string | undefined
    }
    fields?: {
        name?: string
        email?: string
        phone?: string
        password?: string
        confirmPassword?: string
        shopName?: string
        shopEmail?: string
        shopAddress?: string
        shopProductType?: string
        shopSubProductType?: string
        pickupAddress?: string
        pickupArea?: string
        pickupPhone?: string
    }
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const name = form.get('fullName')
    const email = form.get('email')
    const phone = form.get('phone')
    const shopName = form.get('shopName')
    const shopEmail = form.get('shopEmail')
    const shopAddress = form.get('shopAddress')
    const shopProductType = form.get('productType')
    const shopSubProductType = form.get('subProductType')
    const password = form.get('password')
    const confirmPassword = form.get('confirmPassword')
    const pickupAddress = form.get('pickupAddress')
    const pickupArea = form.get('pickupArea')
    const pickupPhone = form.get('pickupPhone')

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof phone !== 'string' ||
        typeof shopName !== 'string' ||
        typeof shopEmail !== 'string' ||
        typeof shopAddress !== 'string' ||
        typeof shopProductType !== 'string' ||
        typeof shopSubProductType !== 'string' ||
        typeof password !== 'string' ||
        typeof confirmPassword !== 'string' ||
        typeof pickupAddress !== 'string' ||
        typeof pickupArea !== 'string' ||
        typeof pickupPhone !== 'string'
    ) {
        return badRequest({
            formError: `Form not submitted correctly.`,
        })
    }

    const fields = {
        name,
        email,
        phone,
        shopName,
        shopEmail,
        shopAddress,
        shopProductType,
        shopSubProductType,
        password,
        confirmPassword,
        pickupAddress,
        pickupArea,
        pickupPhone,
    }
    const fieldErrors = {
        email: validateEmail(email),
        shopEmail: validateEmail(shopEmail),
        password: validatePassword(password),
        confirmPassword: validateConfirmPassword({ password, confirmPassword }),
    }
    if (Object.values(fieldErrors).some(Boolean))
        return badRequest({ fieldErrors, fields })

    const user = await register({
        name,
        email,
        phone,
        password,
        shopName,
        shopEmail,
        shopAddress,
        shopProductType,
        shopSubProductType,
        pickupAddress,
        pickupAreaId: Number(pickupArea),
        pickupPhone,
    })
    if (user && (user as ApiErrorResponse).message) {
        return badRequest({
            fields,
            formError: (user as ApiErrorResponse).message,
        })
    } else if (!user) {
        return badRequest({
            fields,
            formError: 'Something is wrong! Please try again.',
        })
    }
    return { formSuccess: { message: 'Registration Successful' } } as ActionData
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await getUserId(request)
    if (userId) {
        return redirect('/dashboard')
    }
    return null
}
function Register() {
    const actionData = useActionData<ActionData>()
    const transition = useTransition()
    return (
        <Layout>
            <div className="md:flex">
                <LoginRegLeftSide
                    title="Start sending with SendGH"
                    subtitle="Create your shop account, then book pickups and deliveries across Ghana."
                />

                <Box className="flex md:w-1/2 justify-center items-center bg-white overflow-y-auto h-full flex-col">
                    <RegisterForm
                        actionData={actionData}
                        transition={transition}
                    />
                    <Box className="w-3/4 lg:w-3/4 pb-10">
                        <DemoCredentials variant="all" compact />
                    </Box>
                </Box>
            </div>
        </Layout>
    )
}

export default Register
