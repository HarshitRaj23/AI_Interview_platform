import InterviewCard from '@/components/InterviewCard'
import { Button } from '@/components/ui/button'
import { dummyInterviews } from '@/constants'
import { getCurrentUser, getInterviewsByUserId, getLatestInteviews } from '@/lib/actions/auth.action'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
 

const Page = async() => { 
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(user?.id!),
    await getLatestInteviews({userId: user?.id!})
  ]);

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = latestInterviews?.length > 0;

  return (
    <>
      <section className='card-cta'>
        <div className='flex flex-col gap-6 max-w-lg'>
          <h2>Get Interview Ready with AI-Powered Practice & Feedback</h2>
          <p className='text-lg'>Practice on real interview questions and get instant feedback.</p>
          <Button asChild className='btn-primary max-sw:w-full'>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image src="/robot.png" alt="robo-dude" width={400} height={400} className='max-sm:hidden' />
      </section>

      <section className='flex floex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>
        <div className='interview-section'>
          { hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))
          ) : (
            <p>You have no past interviews. </p>
          )}
        </div>
      </section>

      <section className='flex floex-col gap-6 mt-8 mb-16'>
        <h2>Take an Interviews</h2>
        <div className='interview-section'>
          { hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id}/>
            ))
          ) : (
            <p>There are no new interview available.</p>
          )}
        </div>
      </section>
    </>
  )
}

export default Page