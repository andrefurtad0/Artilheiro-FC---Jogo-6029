// Consolidated from useAuth.js, useDemoData.js, useUserProfile.js
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

// AUTH HOOK
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return { user, loading, signIn, signUp, signOut }
}

// USER PROFILE HOOK
export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          team_defending:teams!team_defending_id(*),
          team_heart:teams!team_heart_id(*)
        `)
        .eq('id', userId)
        .single()

      if (!error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  return { profile, loading, refetch: fetchProfile }
}

// DEMO DATA HOOK
export const useDemoData = () => {
  const [demoData, setDemoData] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    const demoMode = localStorage.getItem('demo-mode') === 'true'
    const userData = localStorage.getItem('demo-user')
    if (demoMode && userData) {
      setIsDemoMode(true)
      setDemoData(JSON.parse(userData))
    }
  }, [])

  const getDemoTeams = () => [
    { id: 'team-1', name: 'Flamengo Digital', primary_color: '#FF0000', secondary_color: '#000000' },
    { id: 'team-2', name: 'Corinthians Virtual', primary_color: '#000000', secondary_color: '#FFFFFF' },
    { id: 'team-3', name: 'Palmeiras Cyber', primary_color: '#00FF00', secondary_color: '#FFFFFF' },
    { id: 'team-4', name: 'São Paulo FC Online', primary_color: '#FF0000', secondary_color: '#000000' },
    { id: 'team-5', name: 'Vasco da Gama Net', primary_color: '#000000', secondary_color: '#FFFFFF' },
    { id: 'team-6', name: 'Botafogo Digital', primary_color: '#000000', secondary_color: '#FFFFFF' }
  ]

  const getDemoRounds = () => {
    const now = new Date()
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const endTime = new Date(now.getTime() + 22 * 60 * 60 * 1000)
    return [{
      id: 'round-1',
      team_a_id: 'team-1',
      team_b_id: 'team-2',
      team_a: { id: 'team-1', name: 'Flamengo Digital', primary_color: '#FF0000' },
      team_b: { id: 'team-2', name: 'Corinthians Virtual', primary_color: '#000000' },
      score_team_a: 15,
      score_team_b: 12,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'active'
    }]
  }

  const getDemoRankings = () => [
    { id: 'demo-user-1', name: 'João Silva', gols_current_round: 5, total_goals: 150, team_defending: { name: 'Flamengo Digital' }, avatar_url: 'https://i.pravatar.cc/150?img=1' },
    { id: 'demo-admin', name: 'Admin Demo', gols_current_round: 12, total_goals: 500, team_defending: { name: 'Corinthians Virtual' }, avatar_url: 'https://i.pravatar.cc/150?img=2' },
    { id: 'demo-user-2', name: 'Maria Santos', gols_current_round: 3, total_goals: 75, team_defending: { name: 'Palmeiras Cyber' }, avatar_url: 'https://i.pravatar.cc/150?img=3' }
  ]

  const clearDemo = () => {
    localStorage.removeItem('demo-mode')
    localStorage.removeItem('demo-user')
    setIsDemoMode(false)
    setDemoData(null)
  }

  return { isDemoMode, demoData, getDemoTeams, getDemoRounds, getDemoRankings, clearDemo }
}

// FILE UPLOAD HOOK
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file, bucket = 'avatars') => {
    if (!file) return { error: 'No file provided' }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return { data: data.publicUrl, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setUploading(false)
    }
  }

  return { uploadFile, uploading }
}

// STANDINGS HOOK
export const useStandings = (championshipId) => {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStandings = async () => {
    if (!championshipId) return

    try {
      const { data: teams, error } = await supabase
        .from('championship_teams')
        .select(`
          team:teams(*),
          championship:championships(*)
        `)
        .eq('championship_id', championshipId)

      if (error) throw error

      // Calculate standings for each team
      const standingsData = await Promise.all(
        teams.map(async ({ team }) => {
          const { data: homeMatches } = await supabase
            .from('rounds')
            .select('*')
            .eq('championship_id', championshipId)
            .eq('team_a_id', team.id)
            .eq('status', 'finished')

          const { data: awayMatches } = await supabase
            .from('rounds')
            .select('*')
            .eq('championship_id', championshipId)
            .eq('team_b_id', team.id)
            .eq('status', 'finished')

          let points = 0
          let wins = 0
          let draws = 0
          let losses = 0
          let goalsFor = 0
          let goalsAgainst = 0

          // Process home matches
          homeMatches?.forEach(match => {
            goalsFor += match.score_team_a
            goalsAgainst += match.score_team_b
            if (match.score_team_a > match.score_team_b) {
              wins++
              points += 3
            } else if (match.score_team_a === match.score_team_b) {
              draws++
              points += 1
            } else {
              losses++
            }
          })

          // Process away matches
          awayMatches?.forEach(match => {
            goalsFor += match.score_team_b
            goalsAgainst += match.score_team_a
            if (match.score_team_b > match.score_team_a) {
              wins++
              points += 3
            } else if (match.score_team_b === match.score_team_a) {
              draws++
              points += 1
            } else {
              losses++
            }
          })

          return {
            team,
            points,
            wins,
            draws,
            losses,
            goalsFor,
            goalsAgainst,
            goalDifference: goalsFor - goalsAgainst,
            matches: wins + draws + losses
          }
        })
      )

      // Sort by points, then goal difference, then goals for
      standingsData.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
        return b.goalsFor - a.goalsFor
      })

      setStandings(standingsData)
    } catch (error) {
      console.error('Error fetching standings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [championshipId])

  return { standings, loading, refetch: fetchStandings }
}