https://www.reddit.com/r/degoogle/comments/1q3d2wd/alternatives_or_equivalents_to_listenonrepeat_for/

Alternatives or equivalents to Listenonrepeat? For playing youtube songs & videos on repeat.
Question
I made a post asking over a year ago and got some new comments about
listenonrepeat.com being offline for good now. On listenonrepeat I could just paste in a youtube link and have it play right away, and choose the start and end times for looping, and it had a count for how many times you played the song, as well viewing history (with start & end times saved) so you could easily listen to previous songs.


Upvote
5

Downvote

7
Go to comments


Share
Join the conversation
Sort by:

Best

Search Comments
Expand comment search
Comments Section
u/gearsky avatar
gearsky
•
2mo ago
•
Edited 2mo ago
Having just run into this issue today, one of the search results that came up for me is looptube.io, which at first glance seems to have the same utility (start/end times included). I haven't dug into it particularly deep, so I don't know anything about the safety or background of the site (though uBlock Origin only blocks a couple dozen things on it, and most of those things have google urls, so it seems relatively clean enough), but my first impression of it is that it's pretty decent.

Here's some quick pros and cons I've observed about it after playing around with it slightly:

Pros:

Clean, simple, and uncluttered UI.

Most, of its controls have keyboard shortcuts associated, which it explicitly lists out.

Can set the loop bounds through the same slider method as listenonrepeat, but it also has a loop button that functions as follows: First press sets the start of the loop at the current position in the video, the second press sets the end of the loop at the current position, and the third press resets the loop to the length of the whole video.

It has buttons to adjust the speed of the video, and these adjustments are in steps of +/- .05 and +/- .1 (so you can, for example, go from 1x speed up to either 1.05x or 1.1x)

Both the playback speed and the loop bounds show up as parameters in the URL once you change one of those variables for the first time, and they're done in a pretty easy to understand way (e.g. the one I'm playing around with currently has a URL of "https://looptube.io/?videoId=5iOwoznxzJk&start=0&end=547.4117647058823&rate=1.1", with the stuff beginning with "&start" only appearing after I first change one of the settings). Seeing such a long decimal in that "end" parameter also seems to imply a pretty fine degree of control over where specifically a loop starts and ends, instead of just being locked to the nearest second like I recall listenonrepeat doing.

When using the slider to set the loop bounds, a zoom button becomes active if you set the start and end points close enough together (like maybe an inch apart on my screen?). Clicking the button scales the slider so that the endpoints are roughly an inch and a half apart (on my screen, at least) no matter how close the endpoints were together initially, and adds a scrollbar for ease of navigation along the slider. This allows for a pretty fine level of control over the loop bounds, especially since it seems like you can set the endpoints even closer together while zoomed, then un-zoom and re-zoom to scale the slider even more (since it still sets them to that same inch-and-a-half distance apart even though they're now closer together).

Has the option to take notes under the video.

Cons:

It doesn't seem to have any history tracking (which I suppose could actually be a pro from a certain perspective), so you can't see a list of previously viewed videos or their loop parameters (though, given how the URLs work, you could emulate this manually by copy/pasting the URLs into a .txt file or something like that after you've set up the loop parameters to your taste), nor does it tell you how many times you've looped a given video.

There aren't any clever URL redirects set up, so you can't just swap out the "www.youtube.com" part of of YouTube URL for "looptube.io" and have it automatically bring you to that same video in LoopTube (nor can you just add "repeat" after the word "youtube" in the URL of a YouTube video and have it redirect, like what you could do with listenonrepeat). That was one of my favorite details about listenonrepeat, so I'm a bit sad about that.

The added parameters (start, end, and rate) in the URL seem to only update when the video isn't paused, for some reason. Even when you unpause the video, they don't update until you manually make a change to one of the settings again.

Overall, it seems like a pretty decent replacement.



Upvote
2

Downvote

Reply

Award

Share

u/Master-Factor-2813 avatar
Master-Factor-2813
•
2mo ago
what is this AI Ass answer. looptube is broken and doesnt work



Upvote
1

Downvote

Reply

Award

Share

u/gearsky avatar
gearsky
•
2mo ago
Jesus christ, I don't think I've ever been so insulted in my life. I'm autistic, not a clanker.

And the problem must be on your end, since it works perfectly fine for me.



Upvote
1

Downvote

Reply

Award

Share

u/Master-Factor-2813 avatar
Master-Factor-2813
•
2mo ago
No offense


Upvote
1

Downvote

Reply

Award

Share

u/AutoModerator avatar
AutoModerator
MOD
•
2mo ago
Friendly reminder: if you're looking for a Google service or Google product alternative then feel free to check out our sidebar.

I am a bot, and this action was performed automatically. Please contact the moderators of this subreddit if you have any questions or concerns.


Upvote
1

Downvote

Reply

Award

Share

u/T31K avatar
T31K
•
1mo ago
I made youtubeonloop.com


Upvote
1

Downvote

Reply

Award

Share
