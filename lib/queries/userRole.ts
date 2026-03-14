export async function getUserRole(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-role?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.role;
  } catch (error) {
    console.error('Error fetching user role from API:', error);

    // Fallback to default role in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('API error in production, returning default user role');
      return 'user';
    }

    throw error;
  }
}
