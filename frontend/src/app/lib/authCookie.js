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