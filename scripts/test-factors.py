import runpy,unittest
from pathlib import Path
aggregate=runpy.run_path(str(Path(__file__).with_name('update-factors.py')))['aggregate_factors']
class FactorsTest(unittest.TestCase):
 def test_counts_and_perspective(self):
  base={'game_id':'g','season_type':'REG','home_team':'H','away_team':'A','posteam':'H','defteam':'A','week':'1','qtr':'4','time':'01:00','play_type':'pass','play_id':'1','desc':'Interception','home_wp':'.5','home_wp_post':'.3','interception':'1','fixed_drive':'1','yardline_100':'50'}
  nullified={**base,'play_id':'2','play_type':'no_play','penalty':'1','home_wp_post':'.51'}
  stopped={**base,'play_id':'3','desc':'Third down failed','interception':'0','third_down_failed':'1','yardline_100':'15'}
  missed={**stopped,'play_id':'4','play_type':'field_goal','field_goal_result':'missed','third_down_failed':'0'}
  td={**base,'play_id':'5','interception':'0','touchdown':'1','pass_touchdown':'1','td_team':'H','fixed_drive':'2','yardline_100':'10','home_wp_post':'.9'}
  two={**td,'play_id':'6','two_point_attempt':'1'}
  fumble={**base,'play_id':'7','interception':'0','play_type':'kickoff','fumble_lost':'1','fumbled_1_team':'A','fumble_recovery_1_team':'H','home_wp_post':'.8'}
  g=aggregate([base,nullified,stopped,missed,td,two,fumble],{'g'})['g'];h=g['teams']['H'];a=g['teams']['A']
  self.assertEqual(h['interceptions'],1);self.assertEqual(h['touchdowns'],1);self.assertEqual(h['thirdAttempts'],1);self.assertEqual(h['missedFG'],1);self.assertEqual(h['redZoneTrips'],2);self.assertEqual(h['redZoneTDs'],1);self.assertEqual(h['fumblesLost'],0);self.assertEqual(a['fumblesLost'],1)
  self.assertTrue(any(p['homeImpact']<0 for p in g['plays']));self.assertTrue(all(p['late'] for p in g['plays']))
 def test_no_model_and_incomplete_games(self):
  row={'game_id':'g','season_type':'REG','home_team':'H','away_team':'A','posteam':'H','week':'1','qtr':'1','play_type':'run','desc':'Run','rushing_yards':'15'}
  self.assertEqual(aggregate([row],set()),{});g=aggregate([row],{'g'})['g'];self.assertEqual(g['plays'],[]);self.assertEqual(g['teams']['H']['explosiveRuns'],1)
if __name__=='__main__':unittest.main()
