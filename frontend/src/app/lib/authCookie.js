'use server'
import { cookies } from 'next/headers'
export async function setCookie(response) {
    const cookieStore = await cookies()

    cookieStore.set('token', response.token, { secure: true })
    cookieStore.set('user', JSON.stringify(response.user), { secure: true })
}

export async function deleteCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('user')
}

export async function getCookie() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    const user = cookieStore.get('user')
    return { token: token?.value, user: user?.value ? JSON.parse(user.value) : null }
}