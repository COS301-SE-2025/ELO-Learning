import StreakDisplay from '@/app/ui/streak-display';
import * as api from '@/services/api';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';

// Mock the session hook
jest.mock('next-auth/react');
const mockUseSession = useSession;

// Mock the API functions
jest.mock('@/services/api');
const mockFetchUserStreakInfo = api.fetchUserStreakInfo;
const mockUpdateUserStreak = api.updateUserStreak;

describe('StreakDisplay Component (Profile Page)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    const { container } = render(<StreakDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('should show loading state initially', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockFetchUserStreakInfo.mockReturnValue(new Promise(() => {})); // Never resolves
    mockUpdateUserStreak.mockReturnValue(new Promise(() => {}));

    render(<StreakDisplay />);
    
    // Check for loading animation class since we don't have a specific test ID
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should display streak data correctly', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockUpdateUserStreak.mockResolvedValue({
      success: true,
      unlocked_achievements: []
    });

    mockFetchUserStreakInfo.mockResolvedValue({
      success: true,
      streak_data: {
        current_streak: 5,
        longest_streak: 10,
        last_activity: '2025-09-11'
      }
    });

    render(<StreakDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Current streak
      expect(screen.getByText('Personal Best')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Longest streak
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Fire emoji
      expect(screen.getByText('🏆')).toBeInTheDocument(); // Trophy emoji
    });
  });

  it('should show motivational message for new personal best', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockUpdateUserStreak.mockResolvedValue({
      success: true,
      unlocked_achievements: []
    });

    mockFetchUserStreakInfo.mockResolvedValue({
      success: true,
      streak_data: {
        current_streak: 10,
        longest_streak: 10,
        last_activity: '2025-09-11'
      }
    });

    render(<StreakDisplay />);

    await waitFor(() => {
      expect(screen.getByText('🎉 New personal best! Keep it going!')).toBeInTheDocument();
    });
  });

  it('should show start streak message when streak is 0', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockUpdateUserStreak.mockResolvedValue({
      success: true,
      unlocked_achievements: []
    });

    mockFetchUserStreakInfo.mockResolvedValue({
      success: true,
      streak_data: {
        current_streak: 0,
        longest_streak: 5,
        last_activity: null
      }
    });

    render(<StreakDisplay />);

    await waitFor(() => {
      expect(screen.getByText('🎯 Start your learning streak today!')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockUpdateUserStreak.mockRejectedValue(new Error('Update failed'));
    mockFetchUserStreakInfo.mockRejectedValue(new Error('Fetch failed'));

    render(<StreakDisplay />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load streak data')).toBeInTheDocument();
    });
  });

  it('should call updateUserStreak on mount for daily login tracking', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    });

    mockUpdateUserStreak.mockResolvedValue({
      success: true,
      unlocked_achievements: []
    });

    mockFetchUserStreakInfo.mockResolvedValue({
      success: true,
      streak_data: {
        current_streak: 1,
        longest_streak: 1,
        last_activity: '2025-09-11'
      }
    });

    render(<StreakDisplay />);

    await waitFor(() => {
      expect(mockUpdateUserStreak).toHaveBeenCalledWith('test-user');
      expect(mockFetchUserStreakInfo).toHaveBeenCalledWith('test-user');
    });
  });
});
